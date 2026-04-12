// Simple XP curve: each level requires 100 * level XP.
export function levelFromXp(xp: number): { level: number; progress: number; nextLevelXp: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level += 1;
  }
  const nextLevelXp = level * 100;
  return { level, progress: remaining / nextLevelXp, nextLevelXp };
}

export const XP_PER_VERSE_PERFECT = 20;
export const XP_PER_VERSE_GOOD = 10;
export const XP_PER_STREAK_DAY = 5;
