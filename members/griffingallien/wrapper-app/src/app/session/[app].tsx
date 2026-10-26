import { router, useLocalSearchParams } from 'expo-router';
import { ComponentRef, ComponentType, Ref, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Image, PixelRatio, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { WebView as RNWebView, WebViewMessageEvent } from 'react-native-webview';
import type { IOSWebViewProps } from 'react-native-webview/lib/WebViewTypes';
import { AppBadge, Button } from '@/components/ui';
import { CheckResult, getAgent } from '@/lib/agent';
import { cssFor, evaluateUrl, getApp, onAppSite } from '@/lib/apps';
import { buildInjection, REQUEST_SIGNALS } from '@/lib/inject';
import { SessionLog, useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

type Signals = { url: string; title: string; playing: number; verticalPlaying: number; text: string };
type Status = { kind: 'starting' | CheckResult['status']; text: string };

// react-native-webview's combined iOS + Android + Windows prop types collapse to `never` under
// TypeScript 6, so give the component the iOS props we actually use.
const WebView = RNWebView as unknown as ComponentType<IOSWebViewProps & { ref?: Ref<RNWebView> }>;

const STATUS_COLOR = { starting: colors.muted, on_track: colors.green, unsure: colors.amber, off_track: colors.red };
const SAFARI_UA_SUFFIX = 'Version/18.0 Mobile/15E148 Safari/604.1';

export default function Session() {
  const p = useLocalSearchParams<{ app: string; goal: string; minutes: string; keywords: string; messages: string }>();
  const app = getApp(p.app);
  const goal = p.goal ?? '';
  const granted = Math.max(1, Number(p.minutes) || 5);
  const { prefs, addUsage, logSession, markSessionEnd } = useStore();

  // Everything below is fixed for the whole session.
  const setup = useMemo(() => {
    const keywords = (p.keywords ?? '').split(',').filter(Boolean);
    const filters = prefs.apps[app.id].filters;
    const startUrl = app.startUrl({ keywords, wantsMessages: p.messages === '1', goal });
    // One short video at a time, while the app's short-form filter is on.
    const oneVideo = !!app.singleVideoPath && !!filters[app.shortFormFilter];
    return {
      keywords,
      filters,
      startUrl,
      searchUrl: keywords.length ? app.searchUrl(keywords.join(' ')) : null,
      oneVideo,
      injection: buildInjection(cssFor(app, filters), { oneVideo, hosts: app.hosts }),
      checkEvery: Math.max(15, prefs.checkEverySec),
      usesServer: !!prefs.aiServerUrl.trim(),
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [agentNote, setAgentNote] = useState('');
  const agent = useMemo(() => getAgent(prefs, () => setAgentNote('AI server unreachable, stand-in is checking')), []); // eslint-disable-line react-hooks/exhaustive-deps

  const insets = useSafeAreaInsets();
  const web = useRef<RNWebView>(null);
  const shotView = useRef<ComponentRef<typeof View>>(null);
  const viewSize = useRef({ w: 0, h: 0 });

  const [left, setLeft] = useState(granted * 60);
  const [status, setStatus] = useState<Status>({ kind: 'starting', text: 'First check in a few seconds' });
  const [toast, setToast] = useState<string | null>(null);
  const [ended, setEnded] = useState<string | null>(null);
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [showShot, setShowShot] = useState(false);

  const usedSec = useRef(0);
  const unsaved = useRef(0);
  const offTask = useRef(0);
  const unsureRun = useRef(0);
  const currentUrl = useRef(setup.startUrl);
  const active = useRef(AppState.currentState === 'active');
  const endedRef = useRef(false);
  const checking = useRef(false);
  /** No checks until this time: the page is being redirected, so a screenshot now would be unfair. */
  const quietUntil = useRef(0);
  const signalWaiter = useRef<((s: Signals) => void) | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const flushUsage = () => {
    if (unsaved.current > 0) {
      addUsage(app.id, unsaved.current);
      unsaved.current = 0;
    }
  };

  const end = (why: string) => {
    if (endedRef.current) return;
    endedRef.current = true;
    flushUsage();
    markSessionEnd(app.id, Date.now()); // the wait between unlocks starts now, even if they never answer below
    setEnded(why);
  };

  // Until the session ends, count it as running to its full length. Then closing the app mid-session
  // can't be used to skip the wait between unlocks.
  useEffect(() => {
    markSessionEnd(app.id, Date.now() + granted * 60000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (url: string) => web.current?.injectJavaScript(`location.replace(${JSON.stringify(url)}); true;`);

  const pathOf = (url: string) => {
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  };

  const blocked = () => {
    quietUntil.current = Date.now() + 4000;
    return false;
  };

  const goBack = () => web.current?.injectJavaScript(`history.length > 1 ? history.back() : location.replace(${JSON.stringify(setup.startUrl)}); true;`);

  /** The single short video the user opened (see AppDef.singleVideoPath). */
  const allowedVideo = useRef<string | null>(null);

  /** Apply the user's filters to a page. Returns false if the page must not be shown. */
  const guard = (url: string, how: 'load' | 'spa', prevUrl: string): boolean => {
    const v = evaluateUrl(app, setup.filters, url);
    if (v.action === 'redirect') {
      const target = v.to === 'searchPage' ? app.searchPage : (setup.searchUrl ?? app.searchPage);
      if (!target) return true; // nowhere to send them, so let it through
      flash(v.to === 'searchPage' ? `${v.label} is on, so here's search instead.` : `${v.label} is on, so here's a search for your goal instead.`);
      go(target);
      return blocked();
    }
    if (v.action === 'block') {
      flash(`"${v.label}" is on in your rules, so that page is blocked.`);
      if (how === 'spa') goBack();
      return blocked();
    }
    // One short video at a time: going straight from the video you opened to a different one is
    // swiping to the next, so it's blocked. Opening another one from search or saved is fine.
    const path = pathOf(url);
    if (setup.oneVideo && onAppSite(app, url) && app.singleVideoPath?.test(path) && path !== allowedVideo.current) {
      if (allowedVideo.current && pathOf(prevUrl) === allowedVideo.current) {
        flash('One video at a time: swiping to the next one is off. Go back and tap another.');
        if (how === 'spa') goBack();
        return blocked();
      }
      allowedVideo.current = path;
    }
    return true;
  };

  // Count only time the app is actually open.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      active.current = st === 'active';
      if (!active.current) {
        flushUsage();
        // The timer stops while the app is in the background, so videos must stop too.
        web.current?.injectJavaScript("document.querySelectorAll('video').forEach(function (v) { v.pause(); }); true;");
      }
    });
    const tick = setInterval(() => {
      if (!active.current || endedRef.current) return;
      usedSec.current += 1;
      unsaved.current += 1;
      if (unsaved.current >= 30) flushUsage();
      const remaining = granted * 60 - usedSec.current;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) end("Time's up");
    }, 1000);
    return () => {
      sub.remove();
      clearInterval(tick);
      flushUsage();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- the on-task checker: page info + a screenshot of our own view, judged by the agent
  const requestSignals = () =>
    new Promise<Signals | null>((resolve) => {
      const timer = setTimeout(() => {
        signalWaiter.current = null;
        resolve(null);
      }, 2000);
      signalWaiter.current = (s) => {
        clearTimeout(timer);
        signalWaiter.current = null;
        resolve(s);
      };
      web.current?.injectJavaScript(REQUEST_SIGNALS);
    });

  const screenshot = async (): Promise<string | undefined> => {
    const { w, h } = viewSize.current;
    if (!w || !h) return undefined;
    try {
      const px = 480; // final image width in pixels: small is enough for a check, and cheap to send
      const ratio = PixelRatio.get();
      return await captureRef(shotView, { format: 'jpg', quality: 0.5, result: 'base64', width: px / ratio, height: (px * h) / w / ratio });
    } catch {
      return undefined;
    }
  };

  const strike = (reason: string) => {
    offTask.current += 1;
    unsureRun.current = 0;
    setStatus({ kind: 'off_track', text: reason });
    if (offTask.current >= 2) return end(`Went off task twice. ${reason}`);
    flash(`Off task: ${reason} Taking you back. Once more and the session ends.`);
    go(setup.startUrl);
  };

  const handle = (r: CheckResult) => {
    // Sites often open on their home page before your search loads, so no strikes in the first 30 seconds.
    if (r.status === 'off_track' && usedSec.current < 30) r = { status: 'unsure', reason: r.reason };
    if (r.status === 'on_track') {
      unsureRun.current = 0;
      return setStatus({ kind: 'on_track', text: r.reason || 'On task' });
    }
    if (r.status === 'unsure') {
      unsureRun.current += 1;
      setStatus({ kind: 'unsure', text: r.reason });
      if (unsureRun.current >= 4) {
        unsureRun.current = 0;
        return strike("You've drifted from your goal for a while.");
      }
      if (unsureRun.current % 2 === 1) flash(`Still on "${goal}"? ${r.reason}`);
      return;
    }
    strike(r.reason);
  };

  const runCheck = async () => {
    if (checking.current || endedRef.current || !active.current || Date.now() < quietUntil.current) return;
    checking.current = true;
    try {
      const sig = await requestSignals();
      const shot = await screenshot();
      if (shot) setLastShot(shot);
      const url = sig?.url ?? currentUrl.current;
      const path = pathOf(url) || '/';
      const result = await agent.check({
        app: app.id,
        goal,
        keywords: setup.keywords,
        personalRules: prefs.personalRules,
        url,
        title: sig?.title ?? '',
        text: sig?.text ?? '',
        playing: sig?.playing ?? 0,
        verticalPlaying: sig?.verticalPlaying ?? 0,
        shortForm: !!setup.filters[app.shortFormFilter] && onAppSite(app, url) && app.shortFormPath.test(path),
        elapsedSec: usedSec.current,
        screenshot: setup.usesServer ? shot : undefined, // the stand-in can't read images, so it isn't sent
      });
      if (!endedRef.current && Date.now() >= quietUntil.current) handle(result);
    } catch {
      // A failed check never counts against anyone; the next one will try again.
    } finally {
      checking.current = false;
    }
  };

  useEffect(() => {
    const first = setTimeout(runCheck, 8000);
    const every = setInterval(runCheck, setup.checkEvery * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: { type?: string } & Partial<Signals>;
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'url' && msg.url) {
      const prev = currentUrl.current;
      currentUrl.current = msg.url;
      guard(msg.url, 'spa', prev);
    } else if (msg.type === 'signals') {
      signalWaiter.current?.(msg as Signals);
    } else if (msg.type === 'videoBlocked') {
      flash('One video at a time: swiping to the next one is off. Tap a video to watch it.');
    }
  };

  const onShouldStart = (req: { url: string; isTopFrame?: boolean; navigationType?: string }) => {
    if (/^(about|blob|data):/i.test(req.url)) return true;
    if (!/^https?:/i.test(req.url)) {
      if (__DEV__) console.log('[wrapper] blocked app link', req.url);
      flash('That link tries to open another app, so it stays closed.');
      return false;
    }
    if (req.isTopFrame === false) return true;
    if (!guard(req.url, 'load', currentUrl.current)) return false;
    // iPhones hand a tapped link to the real app (TikTok, Instagram, YouTube) when it's installed.
    // That only happens for taps, so cancel the tap and load the same address from the page's own
    // script, which keeps it inside the wrapper.
    if (req.navigationType === 'click') {
      if (__DEV__) console.log('[wrapper] kept tapped link inside', req.url);
      web.current?.injectJavaScript(`location.assign(${JSON.stringify(req.url)}); true;`);
      return false;
    }
    return true;
  };

  const finish = (outcome: SessionLog['outcome']) => {
    logSession({ app: app.id, goal, grantedMin: granted, usedSec: usedSec.current, outcome, offTask: offTask.current, endedWhy: ended ?? '', at: Date.now() });
    // Back to the Home screen underneath (replacing would stack a second Home on top of it).
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (ended) {
    return (
      <View style={{ flex: 1, padding: 24, paddingTop: insets.top + 40, backgroundColor: colors.bg }}>
        <AppBadge letter={app.letter} color={app.color} size={52} />
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 18 }}>{ended}</Text>
        <Text style={{ color: colors.muted, fontSize: 16, marginTop: 8 }}>
          You asked for: "{goal}". You used {Math.max(1, Math.round(usedSec.current / 60))} of {granted} minutes
          {offTask.current ? ` and went off task ${offTask.current}×` : ''}.
        </Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 28 }}>Did you get what you came for?</Text>
        <Button label="Yes, got it done" color={colors.green} onPress={() => finish('done')} />
        <Button label="Partly" color={colors.amber} onPress={() => finish('partly')} />
        <Button label="I got distracted" kind="ghost" onPress={() => finish('distracted')} />
      </View>
    );
  }

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 14, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppBadge letter={app.letter} color={app.color} size={30} />
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
              {goal}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STATUS_COLOR[status.kind], marginRight: 6 }} />
              <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }} numberOfLines={1}>
                {status.text}
              </Text>
            </View>
          </View>
          <Text style={{ color: left < 60 ? colors.amber : colors.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'], marginRight: 10 }}>
            {mm}:{ss}
          </Text>
          <Pressable
            onPress={() => end('You ended the session')}
            accessibilityRole="button"
            hitSlop={8}
            style={{ backgroundColor: colors.green, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}
          >
            <Text style={{ color: colors.bg, fontWeight: '800', fontSize: 15 }}>I'm done</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => setShowShot((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red, marginRight: 6 }} />
          <Text style={{ color: colors.muted, fontSize: 11 }}>
            Checking this screen every {setup.checkEvery}s · {showShot ? 'hide' : 'see'} last snapshot
            {agentNote ? ` · ${agentNote}` : ''}
          </Text>
        </Pressable>
      </View>

      <View
        ref={shotView}
        collapsable={false}
        style={{ flex: 1 }}
        onLayout={(e) => (viewSize.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <WebView
          ref={web}
          source={{ uri: setup.startUrl }}
          injectedJavaScriptBeforeContentLoaded={setup.injection}
          injectedJavaScript={setup.injection}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStart}
          // Send every link through onShouldStart. By default, links to other apps (tiktok://...)
          // skip it and go straight to the iPhone, which opens the real app.
          originWhitelist={['*']}
          // Picture-in-picture would keep a video playing with the app (and its timer) in the background.
          allowsPictureInPictureMediaPlayback={false}
          applicationNameForUserAgent={SAFARI_UA_SUFFIX}
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          allowsBackForwardNavigationGestures
          style={{ flex: 1, backgroundColor: colors.bg }}
        />
      </View>

      {showShot && lastShot ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${lastShot}` }}
          style={{ position: 'absolute', right: 12, top: insets.top + 80, width: 110, height: 200, borderRadius: 10, borderWidth: 2, borderColor: colors.red }}
          resizeMode="cover"
        />
      ) : null}

      {toast ? (
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: insets.bottom + 16, backgroundColor: '#05070D', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.line }}>
          <Text style={{ color: colors.text, fontSize: 14 }}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}
