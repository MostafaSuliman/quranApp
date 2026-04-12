import { useQuery } from '@tanstack/react-query';
import { generateDailyPlan, DailyPlan } from '@/api/claude';
import { useSecrets } from '@/store/secrets';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';

/**
 * Claude-backed daily plan. If no Anthropic key is configured, a deterministic
 * fallback is returned: next 3 unmemorized ayat after the user's current page.
 * The fallback uses verse-key STRINGS only — no hardcoded Arabic text.
 */
export function useHifzPlan() {
  const { anthropic } = useSecrets();
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const memorized = useProgress((s) => s.memorizedVerseKeys);
  const lastSessionAt = useProgress((s) => s.lastSessionAt);
  const lastPage = useSettings((s) => s.lastPage);

  return useQuery<DailyPlan>({
    queryKey: ['hifz', 'dailyPlan', streak, xp, memorized.length, lastPage, anthropic ? 'with-key' : 'no-key'],
    queryFn: async () => {
      if (!anthropic) {
        return {
          title: 'Today’s practice',
          ayat: suggestNext(memorized, lastPage),
          estMinutes: 15,
          nasiha: 'Consistency beats intensity. A handful of verses every day.',
        };
      }
      const minutes = lastSessionAt
        ? Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / 60000)
        : null;
      return generateDailyPlan(anthropic, {
        streak,
        xp,
        currentJuz: Math.max(1, Math.ceil(lastPage / 20)),
        lastPage,
        memorizedCount: memorized.length,
        minutesSinceLastSession: minutes,
      });
    },
    staleTime: 1000 * 60 * 15,
  });
}

function suggestNext(memorized: string[], lastPage: number): string[] {
  // Deterministic fallback — just propose verse keys the user hasn't hit.
  // We don't know exact verse counts offline, so offer a reasonable default set
  // anchored on the current page: first three verses of a chapter near the page.
  // The real verses are fetched from the API by key in the Session screen.
  const anchors = [
    `${Math.max(1, Math.min(114, Math.ceil(lastPage / 6)))}:1`,
    `${Math.max(1, Math.min(114, Math.ceil(lastPage / 6)))}:2`,
    `${Math.max(1, Math.min(114, Math.ceil(lastPage / 6)))}:3`,
  ];
  return anchors.filter((k) => !memorized.includes(k));
}
