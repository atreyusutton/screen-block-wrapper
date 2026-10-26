import { router, useLocalSearchParams } from 'expo-router';
import { ComponentRef, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { AppBadge, Button, Chip } from '@/components/ui';
import { getAgent, UnlockDecision } from '@/lib/agent';
import { getApp } from '@/lib/apps';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

type Msg = { from: 'agent' | 'me'; text: string };

export default function Ask() {
  const { app: appId } = useLocalSearchParams<{ app: string }>();
  const app = getApp(appId);
  const { prefs, usedTodaySec, sessions, cooldownLeftMin } = useStore();
  const rules = prefs.apps[app.id];
  const [fallbackNote, setFallbackNote] = useState('');
  const agent = useMemo(() => getAgent(prefs, () => setFallbackNote("Couldn't reach the AI server, so the stand-in answered.")), [prefs]);

  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'agent', text: `What do you need ${app.name} for right now?` }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [followUpTo, setFollowUpTo] = useState<string | undefined>();
  const [result, setResult] = useState<UnlockDecision | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  // Hard limits live here in code, not in the agent.
  const usedMin = Math.round(usedTodaySec(app.id) / 60);
  const leftToday = rules.dailyLimitMin - usedMin;
  const cooldown = cooldownLeftMin(app.id);
  const lockedWhy = !rules.enabled
    ? `You turned ${app.name} off in your rules.`
    : leftToday <= 0
      ? `You've used all ${rules.dailyLimitMin} minutes for ${app.name} today.`
      : cooldown > 0
        ? `Your rules say to wait ${cooldown} more minute${cooldown === 1 ? '' : 's'} before the next unlock.`
        : null;

  const send = async () => {
    const reason = input.trim();
    if (!reason || busy || lockedWhy) return;
    setInput('');
    setMsgs((m) => [...m, { from: 'me', text: reason }]);
    setBusy(true);
    const recentGoals = sessions.filter((s) => s.app === app.id && Date.now() - s.at < 24 * 3600e3).map((s) => s.goal);
    // Send the whole conversation, so the answer to a follow-up question keeps the original reason.
    const said = [...msgs.filter((m) => m.from === 'me').map((m) => m.text), reason];
    const d = await agent.decide({ app: app.id, appName: app.name, reason, said, followUpTo, prefs, usedTodayMin: usedMin, recentGoals });
    setBusy(false);

    if (d.decision === 'allow') {
      const minutes = Math.max(0, Math.min(d.minutes, rules.maxSessionMin, leftToday));
      if (minutes < 1) {
        setMsgs((m) => [...m, { from: 'agent', text: "That sounds fine, but you don't have any minutes left today." }]);
        setResult({ ...d, decision: 'deny', minutes: 0 });
      } else {
        const text = minutes < d.minutes ? `${d.message} (Your limits cap this at ${minutes} minutes.)` : d.message;
        setMsgs((m) => [...m, { from: 'agent', text }]);
        setResult({ ...d, minutes });
      }
    } else {
      setMsgs((m) => [...m, { from: 'agent', text: d.message }]);
      if (d.decision === 'clarify') setFollowUpTo(d.message);
      else setResult(d);
    }
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const open = () => {
    if (!result) return;
    router.replace({
      pathname: '/session/[app]',
      params: {
        app: app.id,
        goal: result.goal,
        minutes: String(result.minutes),
        keywords: result.keywords.join(','),
        messages: result.wantsMessages ? '1' : '0',
      },
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 6 }}>
        <AppBadge letter={app.letter} color={app.color} size={38} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{app.name} is paused</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            {Math.max(0, leftToday)} min left today · up to {rules.maxSessionMin} min per unlock
          </Text>
        </View>
        <Chip label={agent.label} color={prefs.aiServerUrl ? colors.purple : colors.muted} />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: 18 }}>
        {msgs.map((m, i) => (
          <View
            key={i}
            style={{
              alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
              backgroundColor: m.from === 'me' ? colors.blue : colors.panel2,
              borderRadius: 16,
              padding: 12,
              marginBottom: 10,
              maxWidth: '85%',
            }}
          >
            <Text style={{ color: m.from === 'me' ? '#0B0F1A' : colors.text, fontSize: 15 }}>{m.text}</Text>
          </View>
        ))}
        {busy && <ActivityIndicator color={colors.muted} style={{ alignSelf: 'flex-start', margin: 8 }} />}
        {lockedWhy && <Text style={{ color: colors.amber, marginTop: 8 }}>{lockedWhy}</Text>}
        {fallbackNote ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{fallbackNote}</Text> : null}
      </ScrollView>

      <View style={{ padding: 18, paddingTop: 6 }}>
        {result?.decision === 'allow' ? (
          <Button label={`Open ${app.name} · ${result.minutes} min`} color={colors.green} onPress={open} />
        ) : !result && !lockedWhy ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="e.g. find the pasta recipe @chefjohn posted"
              placeholderTextColor={colors.muted}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline
              blurOnSubmit
              style={{ flex: 1, backgroundColor: colors.panel2, color: colors.text, borderRadius: 14, padding: 12, fontSize: 15, maxHeight: 120 }}
            />
            <View style={{ width: 90, marginLeft: 8 }}>
              <Button label="Send" onPress={send} disabled={busy || !input.trim()} />
            </View>
          </View>
        ) : null}
        {/* The guilt-free way out: research found this is the most effective part of a pause screen. */}
        <Button label="Never mind, close it" kind="ghost" onPress={() => router.back()} />
      </View>
    </KeyboardAvoidingView>
  );
}
