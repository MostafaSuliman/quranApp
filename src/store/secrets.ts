import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const ANTHROPIC_KEY = 'hifz.secret.anthropic';
const OPENAI_KEY = 'hifz.secret.openai';

export async function getAnthropicKey(): Promise<string | null> {
  return SecureStore.getItemAsync(ANTHROPIC_KEY);
}

export async function setAnthropicKey(key: string): Promise<void> {
  if (!key) {
    await SecureStore.deleteItemAsync(ANTHROPIC_KEY);
    return;
  }
  await SecureStore.setItemAsync(ANTHROPIC_KEY, key);
}

export async function getOpenAIKey(): Promise<string | null> {
  return SecureStore.getItemAsync(OPENAI_KEY);
}

export async function setOpenAIKey(key: string): Promise<void> {
  if (!key) {
    await SecureStore.deleteItemAsync(OPENAI_KEY);
    return;
  }
  await SecureStore.setItemAsync(OPENAI_KEY, key);
}

/** React hook returning both keys (reactive to saves on the same screen). */
export function useSecrets() {
  const [anthropic, setAnthropic] = useState<string | null>(null);
  const [openai, setOpenai] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getAnthropicKey(), getOpenAIKey()]).then(([a, o]) => {
      if (!alive) return;
      setAnthropic(a);
      setOpenai(o);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return {
    anthropic,
    openai,
    loading,
    saveAnthropic: async (k: string) => {
      await setAnthropicKey(k);
      setAnthropic(k || null);
    },
    saveOpenAI: async (k: string) => {
      await setOpenAIKey(k);
      setOpenai(k || null);
    },
  };
}
