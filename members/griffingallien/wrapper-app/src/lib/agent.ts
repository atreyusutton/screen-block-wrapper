// The agent decides (1) whether to unlock an app for the reason the user gave and
// (2) during a session, whether what's on screen still matches that reason.
//
// Two implementations share one interface:
//  - StandInAgent: simple rules that run on the phone, no AI key needed.
//  - RemoteAgent: asks the free AI server on your computer (see ../../server). Falls back
//    to the stand-in if the server can't be reached.
//
// Hard limits (daily minutes, max session, cooldown) are enforced by the screens in code,
// never left to the agent, because a chatbot can be talked around.

import { AppId } from './apps';
import { findPhrase, Prefs } from './prefs';

export type UnlockInput = {
  app: AppId;
  appName: string;
  /** The user's latest message. */
  reason: string;
  /** Everything the user has said in this chat, oldest first (includes `reason`). */
  said: string[];
  /** The agent's previous clarifying question, if it asked one. */
  followUpTo?: string;
  prefs: Prefs;
  usedTodayMin: number;
  recentGoals: string[];
};

export type UnlockDecision = {
  decision: 'allow' | 'deny' | 'clarify';
  minutes: number;
  message: string;
  goal: string;
  keywords: string[];
  wantsMessages: boolean;
};

export type Observation = {
  app: AppId;
  goal: string;
  keywords: string[];
  personalRules: string;
  url: string;
  title: string;
  text: string;
  playing: number;
  verticalPlaying: number;
  shortForm: boolean;
  elapsedSec: number;
  /** JPEG screenshot of our in-app browser, base64 (no data: prefix). */
  screenshot?: string;
};

export type CheckResult = { status: 'on_track' | 'unsure' | 'off_track'; reason: string };

export interface Agent {
  label: string;
  decide(input: UnlockInput): Promise<UnlockDecision>;
  check(obs: Observation): Promise<CheckResult>;
}

// ---------------------------------------------------------------- stand-in

const STOP = new Set(
  'about after again also because been before being could does doing find from going have help into just like look looking make need open some something that their them then there these they thing this want what when where which while with would your instagram youtube tiktok video videos watch watching check checking'.split(' '),
);

const VAGUE = /\b(bored|boredom|idk|nothing|scroll(ing)?|kill(ing)? time|chill(ing)?|whatever|random|for fun|just (looking|checking|browsing))\b/i;

const CATEGORIES: { re: RegExp; minutes: number; kind: string }[] = [
  { re: /\b(dms?|messages?|reply|replying|text(ing)?|chat|inbox)\b/i, minutes: 5, kind: 'message' },
  { re: /\b(post(ing)?|upload(ing)?|share|sharing|story)\b/i, minutes: 10, kind: 'post' },
  { re: /\b(recipes?|cook(ing)?|bake|baking|meal prep|find|look up|lookup|look into|search|event|address|price|buy|sell)\b/i, minutes: 10, kind: 'lookup' },
  { re: /\b(tutorials?|how to|how (does|do)|learn(ing)?|lessons?|class|homework|study|studying|research(ing)?|read about|build(ing)?|fix(ing)?|repair(ing)?|guide|lecture|course)\b/i, minutes: 20, kind: 'learn' },
];

export function keywordsOf(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9@']+/g) ?? [];
  const out: string[] = [];
  for (const w of words) {
    const clean = w.replace(/^@/, '').replace(/'s$/, '');
    if (clean.length < 4 || STOP.has(clean) || out.includes(clean)) continue;
    out.push(clean);
  }
  return out.slice(0, 6);
}

/** decodeURIComponent, but a stray "%" (like "50%off") doesn't throw. */
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export class StandInAgent implements Agent {
  label = 'Stand-in rules';

  async decide(i: UnlockInput): Promise<UnlockDecision> {
    // Judge everything they've said, so an answer to a follow-up question keeps its context.
    const reason = (i.said.length ? i.said.join(' ') : i.reason).trim();
    const words = reason.split(/\s+/).filter(Boolean);
    const base = { goal: reason.slice(0, 90), keywords: keywordsOf(reason), wantsMessages: false };

    const never = findPhrase(i.prefs.neverReasons, reason);
    if (never) {
      return { ...base, decision: 'deny', minutes: 0, message: `You told me "${never}" isn't a good reason for you. Want to do something else instead?` };
    }

    if (VAGUE.test(reason) || words.length < 3) {
      if (!i.followUpTo) {
        return { ...base, decision: 'clarify', minutes: 0, message: `What exactly do you need on ${i.appName}? For example, which recipe, creator or message?` };
      }
      return { ...base, decision: 'deny', minutes: 0, message: "That still sounds like scrolling. Come back when there's something specific you need." };
    }

    const cat = CATEGORIES.find((c) => c.re.test(reason));
    const good = findPhrase(i.prefs.goodReasons, reason);
    const repeats = i.recentGoals.filter((g) => keywordsOf(g).some((k) => base.keywords.includes(k))).length;

    let minutes = cat?.minutes ?? (good ? 10 : words.length >= 5 ? 10 : 0);
    if (!minutes) {
      if (!i.followUpTo) {
        return { ...base, decision: 'clarify', minutes: 0, message: 'Can you be more specific about what you want to get done?' };
      }
      minutes = 5;
    }
    if (repeats >= 3) minutes = Math.max(5, Math.floor(minutes / 2));

    const note = repeats >= 3 ? ` You've asked for this ${repeats} times already today, so I'm keeping it short.` : '';
    return {
      ...base,
      wantsMessages: cat?.kind === 'message',
      decision: 'allow',
      minutes,
      message: `Sounds focused. Unlocking ${i.appName} for ${minutes} minutes for: "${base.goal}".${note} I'll check in while you're there.`,
    };
  }

  async check(o: Observation): Promise<CheckResult> {
    if (o.shortForm) return { status: 'off_track', reason: 'That is a short-form video feed, which your rules block.' };
    if (o.verticalPlaying > 0 && o.app !== 'tiktok') {
      return { status: 'unsure', reason: 'A short vertical video is playing. Is it part of your goal?' };
    }
    if (o.keywords.length && o.elapsedSec > 45) {
      const hay = `${o.title} ${o.text} ${safeDecode(o.url)}`.toLowerCase();
      const hit = o.keywords.some((k) => hay.includes(k.slice(0, Math.max(4, k.length - 2))));
      if (!hit) return { status: 'unsure', reason: `I can't see anything about "${o.goal}" on this page.` };
    }
    return { status: 'on_track', reason: 'Looks on task.' };
  }
}

// ---------------------------------------------------------------- remote (AI server on your PC)

async function postJson<T>(url: string, body: unknown, timeoutMs: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(`Server replied ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export class RemoteAgent implements Agent {
  label = 'AI on your PC';
  private fallback = new StandInAgent();
  constructor(private baseUrl: string, private onFallback?: (why: string) => void) {}

  async decide(i: UnlockInput): Promise<UnlockDecision> {
    try {
      const p = i.prefs;
      const d = await postJson<UnlockDecision>(`${this.baseUrl}/decide`, {
        app: i.app,
        appName: i.appName,
        reason: i.reason,
        said: i.said,
        followUpTo: i.followUpTo,
        usedTodayMin: i.usedTodayMin,
        recentGoals: i.recentGoals,
        rules: {
          goodReasons: p.goodReasons,
          neverReasons: p.neverReasons,
          personalRules: p.personalRules,
          dailyLimitMin: p.apps[i.app].dailyLimitMin,
          maxSessionMin: p.apps[i.app].maxSessionMin,
        },
      }, 20000);
      if (!['allow', 'deny', 'clarify'].includes(d?.decision)) throw new Error('The server sent an answer the app could not read');
      return d;
    } catch (e) {
      this.onFallback?.(String(e));
      return this.fallback.decide(i);
    }
  }

  async check(o: Observation): Promise<CheckResult> {
    try {
      const r = await postJson<CheckResult>(`${this.baseUrl}/check`, o, 20000);
      if (!['on_track', 'unsure', 'off_track'].includes(r?.status)) throw new Error('The server sent an answer the app could not read');
      return { status: r.status, reason: typeof r.reason === 'string' ? r.reason : '' };
    } catch (e) {
      this.onFallback?.(String(e));
      return this.fallback.check(o);
    }
  }
}

export function getAgent(prefs: Prefs, onFallback?: (why: string) => void): Agent {
  const url = prefs.aiServerUrl.trim().replace(/\/+$/, '');
  return url ? new RemoteAgent(url, onFallback) : new StandInAgent();
}
