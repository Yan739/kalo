import { create } from 'zustand';

import { getProfile } from '@/db/repositories/profileRepo';
import {
  deleteEntry,
  insertEntry,
  listByDate,
  totalsByDate,
} from '@/db/repositories/logRepo';
import { todayKey } from '@/services/date';
import type { HealthSnapshot } from '@/services/healthConnect';
import type {
  DailyTotals,
  Goal,
  LogEntry,
  MacroGrams,
  NewLogEntry,
} from '@/types/domain';

const EMPTY_TOTALS: DailyTotals = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 };
const EMPTY_MACROS: MacroGrams = { proteinG: 0, carbG: 0, fatG: 0 };

interface DayState {
  date: string;
  entries: LogEntry[];
  totals: DailyTotals;
  targetKcal: number;
  targetMacros: MacroGrams;
  goal: Goal | null;
  hasProfile: boolean;
  health: HealthSnapshot | null;
  loading: boolean;
  loadDay: (date?: string) => Promise<void>;
  addEntry: (entry: Omit<NewLogEntry, 'logDate'>) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
  setHealth: (snapshot: HealthSnapshot) => void;
}

export const useDayStore = create<DayState>((set, get) => ({
  date: todayKey(),
  entries: [],
  totals: EMPTY_TOTALS,
  targetKcal: 0,
  targetMacros: EMPTY_MACROS,
  goal: null,
  hasProfile: false,
  health: null,
  loading: false,

  loadDay: async (date) => {
    const target = date ?? todayKey();
    set({ loading: true, date: target });
    const [entries, totals, stored] = await Promise.all([
      listByDate(target),
      totalsByDate(target),
      getProfile(),
    ]);
    set({
      entries,
      totals,
      targetKcal: stored?.targets.targetKcal ?? 0,
      targetMacros: stored?.targets.macros ?? EMPTY_MACROS,
      goal: stored?.profile.goal ?? null,
      hasProfile: stored !== null,
      loading: false,
    });
  },

  addEntry: async (entry) => {
    const date = get().date;
    await insertEntry({ ...entry, logDate: date });
    const [entries, totals] = await Promise.all([
      listByDate(date),
      totalsByDate(date),
    ]);
    set({ entries, totals });
  },

  removeEntry: async (id) => {
    const date = get().date;
    await deleteEntry(id);
    const [entries, totals] = await Promise.all([
      listByDate(date),
      totalsByDate(date),
    ]);
    set({ entries, totals });
  },

  setHealth: (snapshot) => set({ health: snapshot }),
}));
