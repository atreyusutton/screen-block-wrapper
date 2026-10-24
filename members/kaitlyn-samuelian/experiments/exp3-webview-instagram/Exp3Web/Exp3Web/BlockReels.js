// Injected at document start into instagram.com pages (Exp3Web).
// It doesn't read the page, forms or messages. The only thing it reports to
// the app is "allowed" or "blocked" when a full-screen video plays, with no
// details about which video.
(() => {
  // Layer 2: hide links to the Reels feed, profile Reels tabs and the Explore grid.
  // It matches link addresses, not visible text, so it works in any language.
  const style = document.createElement("style");
  style.textContent = `
    a[href$="/reels/"],
    a[href="/explore/"],
    a[href$="instagram.com/explore/"] {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // Layer 1b: Reels reached by scrolling.
  // Instagram's Reel viewer (for example, a Reel opened from a DM) keeps the page
  // address the same while it loads "Suggested" Reels, so the app's address guard
  // can't see them. Rule: a full-screen video started within a few seconds of a tap
  // may play; a different full-screen video that starts without one is paused.
  const tapWindowMs = 4000;
  const fullScreenShare = 0.8;
  let lastTap = 0;
  let allowed = null; // { video, source } the user opened by tapping

  const report = (decision) =>
    window.webkit?.messageHandlers?.exp3?.postMessage({ type: "video", decision });

  const isFullScreen = (video) => {
    const box = video.getBoundingClientRect();
    const visibleHeight = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
    return visibleHeight >= fullScreenShare * innerHeight && box.width >= 0.9 * innerWidth;
  };

  const check = (video) => {
    if (video.paused || !isFullScreen(video)) return;
    const source = video.currentSrc || video.src;
    if (allowed && allowed.video === video && allowed.source === source) return;
    if (Date.now() - lastTap < tapWindowMs) {
      allowed = { video, source };
      report("allowed");
    } else {
      video.pause();
      report("blocked");
    }
  };

  document.addEventListener("click", () => { lastTap = Date.now(); }, true);

  // "play" doesn't bubble, so listen in the capture phase. The interval also catches
  // a video that started just off-screen and was then scrolled into view.
  document.addEventListener("play", (event) => {
    if (event.target instanceof HTMLVideoElement) check(event.target);
  }, true);
  setInterval(() => document.querySelectorAll("video").forEach(check), 1000);
})();
