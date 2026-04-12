import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { XP_PER_STREAK_DAY, XP_PER_VERSE_GOOD, XP_PER_VERSE_PERFECT } from '@/utils/xp';

interface ProgressState {
  streak: number;
  lastSessionAt: string | null; // ISO date
  xp: number;
  memorizedVerseKeys: string[];
  perJuzScore: Record<number, number>; // juz 1-30 → 0..1
  finishSession: (verseKeys: string[], perfect: boolean, juzNumbers: number[]) => void;
  reset: () => void;
}

function isSameDay(a: string | null, b: Date): boolean {
  if (!a) return false;
  const d = new Date(a);
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}

function isYesterday(a: string | null, b: Date): boolean {
  if (!a) return false;
  const d = new Date(a);
  const y = new Date(b);
  y.setDate(y.getDate() - 1);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastSessionAt: null,
      xp: 0,
      memorizedVerseKeys: [],
      perJuzScore: {},
      finishSession: (verseKeys, perfect, juzNumbers) => {
        const now = new Date();
        const state = get();
        let streak = state.streak;
        if (isSameDay(state.lastSessionAt, now)) {
          // unchanged
        } else if (isYesterday(state.lastSessionAt, now) || state.lastSessionAt === null) {
          streak = state.streak + 1;
        } else {
          streak = 1;
        }
        const gainedPerVerse = perfect ? XP_PER_VERSE_PERFECT : XP_PER_VERSE_GOOD;
        const xpGain = verseKeys.length * gainedPerVerse + (streak > state.streak ? XP_PER_STREAK_DAY : 0);
        const memorized = Array.from(new Set([...state.memorizedVerseKeys, ...verseKeys]));
        const perJuz = { ...state.perJuzScore };
        for (const juz of juzNumbers) {
          perJuz[juz] = Math.min(1, (perJuz[juz] ?? 0) + 0.02);
        }
        set({
          streak,
          lastSessionAt: now.toISOString(),
          xp: state.xp + xpGain,
          memorizedVerseKeys: memorized,
          perJuzScore: perJuz,
        });
      },
      reset: () =>
        set({ streak: 0, lastSessionAt: null, xp: 0, memorizedVerseKeys: [], perJuzScore: {} }),
    }),
    {
      name: 'hifz.progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
