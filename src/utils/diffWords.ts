import type { RecitationErrorWord } from '@/api/claude';

/**
 * Fallback word diff used only when Claude is unavailable.
 * It never fabricates Arabic — it simply aligns tokens that the API returned
 * against the user's transcription. Each token is already Arabic text from the
 * quran.com response.
 */
export function fallbackDiff(expectedWords: string[], transcribed: string): RecitationErrorWord[] {
  const said = transcribed.trim().split(/\s+/).filter(Boolean);
  const out: RecitationErrorWord[] = [];

  let i = 0;
  for (const word of expectedWords) {
    const saidWord = said[i];
    if (!saidWord) {
      out.push({ word, status: 'missing' });
      continue;
    }
    if (normalize(saidWord) === normalize(word)) {
      out.push({ word, status: 'correct' });
    } else {
      out.push({ word, status: 'wrong' });
    }
    i += 1;
  }

  while (i < said.length) {
    out.push({ word: said[i], status: 'extra' });
    i += 1;
  }

  return out;
}

function normalize(w: string): string {
  // Strip diacritics (Arabic combining marks U+064B-U+065F and U+0670) before comparing.
  return w.replace(/[\u064B-\u065F\u0670]/g, '');
}
