const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Transcribes an Arabic audio file via OpenAI Whisper.
 * Returns the raw transcription string (verses, no diacritics).
 */
export async function transcribeArabic(apiKey: string, fileUri: string): Promise<string> {
  const form = new FormData();
  // React Native's FormData accepts { uri, name, type } shape for file blobs.
  form.append('file', {
    uri: fileUri,
    name: 'recitation.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  form.append('model', 'whisper-1');
  form.append('language', 'ar');
  form.append('response_format', 'json');

  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Whisper failed: ${res.status}`);
  }

  const json = (await res.json()) as { text: string };
  return json.text;
}
