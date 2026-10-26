import { APPS, AppId } from './apps';

export type AppRules = {
  enabled: boolean;
  dailyLimitMin: number;
  maxSessionMin: number;
  filters: Record<string, boolean>;
};

/** Everything a user can set in "My rules". Stored only on their own phone. */
export type Prefs = {
  apps: Record<AppId, AppRules>;
  /** Reasons that are fine for this user, e.g. "messages from friends, recipes". */
  goodReasons: string;
  /** Reasons that are never fine, e.g. "scrolling, bored, reels". */
  neverReasons: string;
  /** Free-text rules handed to the AI agent, e.g. "No short videos. Nothing after 10pm." */
  personalRules: string;
  cooldownMin: number;
  checkEverySec: number;
  /** Address of the AI server on your computer. Empty = use the built-in stand-in. */
  aiServerUrl: string;
};

export function defaultPrefs(): Prefs {
  const apps = {} as Record<AppId, AppRules>;
  for (const a of APPS) {
    apps[a.id] = {
      enabled: true,
      dailyLimitMin: 30,
      maxSessionMin: 20,
      filters: Object.fromEntries(a.filters.map((f) => [f.key, f.default])),
    };
  }
  return {
    apps,
    goodReasons: 'messages from friends, recipes, tutorials',
    neverReasons: 'bored, scrolling, reels',
    personalRules: 'No short-form videos. Keep sessions focused on one thing.',
    cooldownMin: 0,
    checkEverySec: 30,
    aiServerUrl: '',
  };
}

/** Fill in anything missing from saved prefs (e.g. a filter added in a newer version). */
export function withDefaults(saved: Partial<Prefs> | null | undefined): Prefs {
  const d = defaultPrefs();
  if (!saved) return d;
  const apps = { ...d.apps };
  for (const a of APPS) {
    const s = saved.apps?.[a.id];
    if (s) apps[a.id] = { ...d.apps[a.id], ...s, filters: { ...d.apps[a.id].filters, ...s.filters } };
  }
  return { ...d, ...saved, apps };
}

export const splitList = (s: string) =>
  s
    .split(/[,\n;]/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

/** The first phrase from a comma-separated list that appears in `text` as whole words ("fun" doesn't match "refund"). */
export const findPhrase = (list: string, text: string) =>
  splitList(list).find((p) => p.length > 2 && new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
