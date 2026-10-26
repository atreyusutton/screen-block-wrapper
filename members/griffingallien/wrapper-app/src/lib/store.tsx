import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppId } from './apps';
import { Prefs, withDefaults } from './prefs';

export type SessionLog = {
  app: AppId;
  goal: string;
  grantedMin: number;
  usedSec: number;
  outcome: 'done' | 'partly' | 'distracted' | 'ended';
  offTask: number;
  endedWhy: string;
  at: number;
};

type Usage = Record<string, Partial<Record<AppId, number>>>; // day -> app -> seconds

const KEYS = { prefs: 'wrapper.prefs.v1', usage: 'wrapper.usage.v1', sessions: 'wrapper.sessions.v1', lastEnd: 'wrapper.lastEnd.v1' };

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

type Store = {
  ready: boolean;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  usedTodaySec: (app: AppId) => number;
  addUsage: (app: AppId, sec: number) => void;
  sessions: SessionLog[];
  logSession: (s: SessionLog) => void;
  /** When the current (or last) session for an app ends. The wait between unlocks counts from here. */
  markSessionEnd: (app: AppId, at: number) => void;
  cooldownLeftMin: (app: AppId) => number;
};

const Ctx = createContext<Store | null>(null);

async function load<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
const save = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefsState] = useState<Prefs>(withDefaults(null));
  const [usage, setUsage] = useState<Usage>({});
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [lastEnd, setLastEnd] = useState<Partial<Record<AppId, number>>>({});

  useEffect(() => {
    (async () => {
      setPrefsState(withDefaults(await load<Partial<Prefs>>(KEYS.prefs)));
      setUsage((await load<Usage>(KEYS.usage)) ?? {});
      setSessions((await load<SessionLog[]>(KEYS.sessions)) ?? []);
      setLastEnd((await load<Partial<Record<AppId, number>>>(KEYS.lastEnd)) ?? {});
      setReady(true);
    })();
  }, []);

  const setPrefs = useCallback((p: Prefs) => {
    setPrefsState(p);
    save(KEYS.prefs, p);
  }, []);

  const addUsage = useCallback((app: AppId, sec: number) => {
    setUsage((u) => {
      const day = today();
      const next: Usage = { [day]: { ...u[day], [app]: (u[day]?.[app] ?? 0) + sec } }; // keep only today
      save(KEYS.usage, next);
      return next;
    });
  }, []);

  const markSessionEnd = useCallback((app: AppId, at: number) => {
    setLastEnd((l) => {
      const next = { ...l, [app]: at };
      save(KEYS.lastEnd, next);
      return next;
    });
  }, []);

  const logSession = useCallback(
    (s: SessionLog) => {
      setSessions((all) => {
        const next = [s, ...all].slice(0, 50);
        save(KEYS.sessions, next);
        return next;
      });
      markSessionEnd(s.app, s.at);
    },
    [markSessionEnd],
  );

  const value = useMemo<Store>(
    () => ({
      ready,
      prefs,
      setPrefs,
      usedTodaySec: (app) => usage[today()]?.[app] ?? 0,
      addUsage,
      sessions,
      logSession,
      markSessionEnd,
      cooldownLeftMin: (app) => {
        const end = lastEnd[app];
        if (!end || prefs.cooldownMin <= 0) return 0;
        // `end` can be in the future while a session is (or was) running: wait for it, plus the cooldown.
        return Math.max(0, Math.ceil(prefs.cooldownMin - (Date.now() - end) / 60000));
      },
    }),
    [ready, prefs, setPrefs, usage, addUsage, sessions, logSession, markSessionEnd, lastEnd],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
