// The social apps the wrapper can open, and the parts of each one a user can hide.
//
// Each app is loaded as its mobile website inside our own WebView. Hiding works two ways:
//  - `css`: injected CSS that hides links/sections (fragile: sites change their markup often)
//  - `blockPaths`: page addresses we refuse to show at all (more reliable)
//  - `redirectPaths`: page addresses we swap for a search for the user's stated goal
//    (or, with `redirectTo: 'searchPage'`, for the app's plain search page)

export type AppId = 'instagram' | 'youtube' | 'tiktok';

export type FilterDef = {
  key: string;
  label: string;
  help?: string;
  default: boolean;
  css?: string;
  blockPaths?: RegExp[];
  redirectPaths?: RegExp[];
  redirectTo?: 'goalSearch' | 'searchPage';
};

export type StartContext = { keywords: string[]; wantsMessages: boolean; goal: string };

export type AppDef = {
  id: AppId;
  name: string;
  letter: string;
  color: string;
  home: string;
  /** The app's own websites. Filters only apply there, not to other sites linked from it. */
  hosts: RegExp;
  searchUrl: (q: string) => string;
  /** The plain search page, used when there's no goal to search for. */
  searchPage?: string;
  startUrl: (ctx: StartContext) => string;
  /** Pages that are short-form video feeds, which the checker treats as off task... */
  shortFormPath: RegExp;
  /** ...but only while this filter is on (the user may have chosen to allow them). */
  shortFormFilter: string;
  /**
   * A page showing one short video. While `shortFormFilter` is on, a video you tap plays, but
   * moving straight from it to another one (scrolling) is blocked. Idea from Kaitlyn's
   * Reels-free Instagram experiment.
   */
  singleVideoPath?: RegExp;
  filters: FilterDef[];
  note?: string;
};

// "@natgeo" at the start or after a space, but not an email address; a trailing "." is punctuation.
const handleIn = (goal: string) => goal.match(/(?:^|\s)@([A-Za-z0-9._]{2,30})/)?.[1].replace(/\.+$/, '') || undefined;

// TikTok's For You feed: "/", "/foryou", optionally after a language part like "/en".
const TIKTOK_FOR_YOU = /^\/([a-z]{2}(-[a-z]{2})?\/?)?(foryou)?\/?$/i;

export const APPS: AppDef[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    letter: 'IG',
    color: '#E1306C',
    home: 'https://www.instagram.com/',
    hosts: /(^|\.)instagram\.com$/i,
    searchUrl: (q) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}`,
    searchPage: 'https://www.instagram.com/explore/search/',
    startUrl: ({ wantsMessages, goal, keywords }) => {
      if (wantsMessages) return 'https://www.instagram.com/direct/inbox/';
      const handle = handleIn(goal);
      if (handle) return `https://www.instagram.com/${handle}/`;
      return keywords.length ? `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(keywords.join(' '))}` : 'https://www.instagram.com/';
    },
    shortFormPath: /^\/reels\/?$/,
    shortFormFilter: 'hideReels',
    singleVideoPath: /^\/reels?\/[^/]+\/?$/,
    filters: [
      {
        key: 'hideReels',
        label: 'Hide Reels',
        help: 'A Reel you tap still plays, but not the next one',
        default: true,
        // The Reels tab and each profile's Reels tab. Links to single Reels stay, so a recipe
        // Reel in search results or your saved posts can still be opened.
        css: 'a[href="/reels/"], a[href$="/reels/"] { display: none !important; }',
        blockPaths: [/^\/reels\/?$/, /^\/[^/]+\/reels\/?$/],
      },
      {
        key: 'hideExplore',
        label: 'Hide Explore',
        help: 'Search still works',
        default: true,
        // On the website, the Search button opens the Explore grid, so swap it for the search page.
        css: 'html[data-wrapper-path="/explore/"] main { visibility: hidden !important; }',
        redirectPaths: [/^\/explore\/?$/],
        redirectTo: 'searchPage',
      },
      {
        key: 'hideFeed',
        label: 'Hide home feed',
        help: 'Keeps Stories, profiles and DMs',
        default: false,
        css: 'html[data-wrapper-path="/"] main article { display: none !important; }',
      },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    letter: 'YT',
    color: '#E62117',
    home: 'https://m.youtube.com/',
    hosts: /(^|\.)youtube\.com$/i,
    searchUrl: (q) => `https://m.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    startUrl: ({ keywords }) =>
      keywords.length ? `https://m.youtube.com/results?search_query=${encodeURIComponent(keywords.join(' '))}` : 'https://m.youtube.com/',
    shortFormPath: /^\/shorts\//,
    shortFormFilter: 'hideShorts',
    filters: [
      {
        key: 'hideShorts',
        label: 'Hide Shorts',
        default: true,
        css: [
          'ytm-reel-shelf-renderer',
          'ytm-shorts-lockup-view-model',
          'ytm-shorts-lockup-view-model-v2',
          'ytm-pivot-bar-item-renderer:has(.pivot-shorts)',
          'a[href^="/shorts"]',
        ].join(', ') + ' { display: none !important; }',
        blockPaths: [/^\/shorts\//],
      },
      {
        key: 'searchFirst',
        label: 'Skip the home feed',
        help: 'Opens a search for your goal instead',
        default: true,
        redirectPaths: [/^\/$/],
      },
      {
        key: 'hideRelated',
        label: 'Hide "up next" suggestions',
        default: false,
        css: 'ytm-item-section-renderer[section-identifier="related-items"], ytm-autonav-toggle-button-container { display: none !important; }',
      },
      {
        key: 'hideComments',
        label: 'Hide comments',
        default: false,
        css: 'ytm-comments-entry-point-header-renderer, ytm-comment-section-renderer, [section-identifier="comment-item-section"] { display: none !important; }',
      },
    ],
    note: 'YouTube works signed out here (Google blocks sign-in inside apps).',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    letter: 'TT',
    color: '#25F4EE',
    home: 'https://www.tiktok.com/',
    hosts: /(^|\.)tiktok\.com$/i,
    searchUrl: (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    searchPage: 'https://www.tiktok.com/search',
    startUrl: ({ keywords, goal }) => {
      const handle = handleIn(goal);
      if (handle) return `https://www.tiktok.com/@${handle}`;
      return keywords.length ? `https://www.tiktok.com/search?q=${encodeURIComponent(keywords.join(' '))}` : 'https://www.tiktok.com/search';
    },
    shortFormPath: TIKTOK_FOR_YOU,
    shortFormFilter: 'hideForYou',
    singleVideoPath: /^\/@[^/]+\/video\/\d+/,
    filters: [
      {
        key: 'hideForYou',
        label: 'Skip the For You feed',
        help: 'Opens a search for your goal instead. A video you tap plays, but not the next one',
        default: true,
        css: 'a[href^="/foryou"], a[href="/"], a[href^="/?"] { display: none !important; }',
        redirectPaths: [TIKTOK_FOR_YOU],
      },
      {
        key: 'hideExplore',
        label: 'Hide Explore',
        default: true,
        css: 'a[href^="/explore"] { display: none !important; }',
        blockPaths: [/^\/explore/],
      },
      {
        key: 'hideLive',
        label: 'Hide LIVE',
        default: true,
        css: 'a[href^="/live"] { display: none !important; }',
        blockPaths: [/^\/live/],
      },
    ],
    note: "TikTok's website is limited and may ask you to log in or open the app.",
  },
];

export const getApp = (id: string | undefined): AppDef => APPS.find((a) => a.id === id) ?? APPS[0];

export type UrlVerdict =
  | { action: 'allow' }
  | { action: 'block'; label: string }
  | { action: 'redirect'; label: string; to: 'goalSearch' | 'searchPage' };

/** Is this address on the app's own website (not another site linked from it)? */
export function onAppSite(app: AppDef, url: string): boolean {
  try {
    return app.hosts.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Decide what to do with a page the user is about to see, given their enabled filters. */
export function evaluateUrl(app: AppDef, enabled: Record<string, boolean>, url: string): UrlVerdict {
  if (!onAppSite(app, url)) return { action: 'allow' };
  const path = new URL(url).pathname;
  for (const f of app.filters) {
    if (!enabled[f.key]) continue;
    if (f.blockPaths?.some((re) => re.test(path))) return { action: 'block', label: f.label };
    if (f.redirectPaths?.some((re) => re.test(path))) return { action: 'redirect', label: f.label, to: f.redirectTo ?? 'goalSearch' };
  }
  return { action: 'allow' };
}

/** CSS for every enabled filter of an app. */
export const cssFor = (app: AppDef, enabled: Record<string, boolean>) =>
  app.filters.filter((f) => enabled[f.key] && f.css).map((f) => f.css).join('\n');
