// JavaScript that runs inside the social media page (inside our WebView).
// It hides the parts the user turned off, reports every page change back to the app,
// and, when asked, reports what is on screen (title, text, playing videos) for the on-task check.
// With `oneVideo`, it also stops full-screen videos reached by scrolling (see below).

export function buildInjection(css: string, opts: { oneVideo: boolean; hosts: RegExp }): string {
  return `(function () {
  if (window.__wrapper) return true;
  window.__wrapper = true;
  // Hiding rules only apply on the app's own site, not on other sites linked from it.
  var ON_APP = new RegExp(${JSON.stringify(opts.hosts.source)}, 'i').test(location.hostname);
  var CSS = ON_APP ? ${JSON.stringify(css)} : '';
  var ONE_VIDEO = ON_APP && ${opts.oneVideo};
  function post(type, data) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data || {}))); } catch (e) {}
  }
  function addStyle() {
    if (!CSS || document.getElementById('__wrapper_css')) return;
    var s = document.createElement('style');
    s.id = '__wrapper_css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  var last = '';
  function report() {
    addStyle();
    document.documentElement.setAttribute('data-wrapper-path', location.pathname);
    if (location.href !== last) {
      last = location.href;
      post('url', { url: location.href, title: document.title });
    }
  }
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () { var r = orig.apply(this, arguments); setTimeout(report, 0); return r; };
  });
  window.addEventListener('popstate', report);
  // Going back can restore a page from memory without reloading it; report its address again.
  window.addEventListener('pageshow', function (e) { if (e.persisted) { last = ''; report(); } });
  document.addEventListener('DOMContentLoaded', report);
  setInterval(report, 700);
  report();
  if (ONE_VIDEO) {
    // One video at a time (idea from Kaitlyn's Reels-free Instagram experiment). Sites load the
    // next Reel or TikTok as you swipe, sometimes without changing the address. So: the first
    // full-screen video on a page may play, and so may one you tap; a different one that starts
    // without a tap was reached by swiping, so it's paused. Swipes don't fire "click"; taps do.
    var lastTap = 0;
    var allowed = null;
    var blockedSrc = '';
    document.addEventListener('click', function () { lastTap = Date.now(); }, true);
    var fullScreen = function (v) {
      var r = v.getBoundingClientRect();
      var visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      return visible >= 0.8 * innerHeight && r.width >= 0.9 * innerWidth;
    };
    var checkVideo = function (v) {
      if (v.paused || !fullScreen(v)) return;
      var src = v.currentSrc || v.src;
      if (allowed && allowed.v === v && allowed.src === src) return;
      if (!allowed || Date.now() - lastTap < 4000) { allowed = { v: v, src: src }; return; }
      v.pause();
      if (blockedSrc !== src) { blockedSrc = src; post('videoBlocked'); }
    };
    document.addEventListener('play', function (e) {
      if (e.target && e.target.tagName === 'VIDEO') checkVideo(e.target);
    }, true);
    setInterval(function () { Array.prototype.forEach.call(document.querySelectorAll('video'), checkVideo); }, 1000);
  }
  window.__wrapperSignals = function () {
    var vids = Array.prototype.slice.call(document.querySelectorAll('video'));
    var playing = vids.filter(function (v) { return !v.paused && !v.ended && v.readyState > 2; });
    var vertical = playing.filter(function (v) { return v.videoHeight > v.videoWidth * 1.2; });
    var text = ((document.body && document.body.innerText) || '').replace(/\\s+/g, ' ').slice(0, 800);
    post('signals', { url: location.href, title: document.title, playing: playing.length, verticalPlaying: vertical.length, text: text });
  };
})();
true;`;
}

export const REQUEST_SIGNALS = 'window.__wrapperSignals && window.__wrapperSignals(); true;';
