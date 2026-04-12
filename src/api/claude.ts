import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-6';

export interface DailyPlanInput {
  streak: number;
  xp: number;
  currentJuz: number;
  lastPage: number;
  memorizedCount: number;
  minutesSinceLastSession: number | null;
}

export interface DailyPlan {
  title: string;
  ayat: string[]; // verse_keys to memorize today
  estMinutes: number;
  nasiha: string; // short motivational note (will come from Claude, not hardcoded Arabic)
}

export interface RecitationErrorWord {
  word: string;
  status: 'correct' | 'missing' | 'wrong' | 'extra';
}

function getClient(apiKey: string) {
  return new Anthropic({
    apiKey,
    // RN fetch is available; SDK accepts it automatically.
  });
}

export async function generateDailyPlan(apiKey: string, input: DailyPlanInput): Promise<DailyPlan> {
  const client = getClient(apiKey);
  const system =
    'You are a Quran memorization coach. Respond ONLY with minified JSON matching the requested schema. No prose, no markdown fences.';
  const user = `Generate today's memorization plan.
Student state: ${JSON.stringify(input)}
Pick 3-5 verse keys (format "chapter:verse") that build on their current Juz ${input.currentJuz} and streak of ${input.streak} days. Keep estMinutes realistic (10-30). The nasiha must be a brief encouraging note.
Schema: {"title": string, "ayat": string[], "estMinutes": number, "nasiha": string}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text = response.content
    .map((block) => ('text' in block ? block.text : ''))
    .join('')
    .trim();
  return JSON.parse(text) as DailyPlan;
}

export async function analyzeRecitation(
  apiKey: string,
  expectedText: string,
  transcribedText: string
): Promise<RecitationErrorWord[]> {
  const client = getClient(apiKey);
  const system =
    'You compare Quranic recitations. Respond ONLY with minified JSON array. Do not include any prose.';
  const user = `Expected verse (Uthmani): ${expectedText}
User said: ${transcribedText}
Return a JSON array aligned to the EXPECTED verse words. For each expected word output {"word": <expected>, "status": "correct" | "missing" | "wrong" | "extra"}. A word is "correct" if the user said it, "missing" if they skipped it, "wrong" if they said something different, "extra" only for extraneous words the user added before/after (append these at the end with the user's word).`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text = response.content
    .map((block) => ('text' in block ? block.text : ''))
    .join('')
    .trim();
  return JSON.parse(text) as RecitationErrorWord[];
}
