import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeMode } from '@/theme/colors';

interface SettingsState {
  themePreference: ThemeMode | 'auto';
  resolvedTheme: ThemeMode;
  reciterId: number | null;
  lastPage: number;
  hydrated: boolean;
  setThemePreference: (pref: ThemeMode | 'auto') => void;
  setReciterId: (id: number) => void;
  setLastPage: (page: number) => void;
  markHydrated: () => void;
}

function resolve(pref: ThemeMode | 'auto'): ThemeMode {
  if (pref === 'auto') {
    return (Appearance.getColorScheme() as ThemeMode) ?? 'light';
  }
  return pref;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      themePreference: 'auto',
      resolvedTheme: resolve('auto'),
      reciterId: null,
      lastPage: 1,
      hydrated: false,
      setThemePreference: (pref) => set({ themePreference: pref, resolvedTheme: resolve(pref) }),
      setReciterId: (id) => set({ reciterId: id }),
      setLastPage: (page) => set({ lastPage: page }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'hifz.settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        themePreference: s.themePreference,
        reciterId: s.reciterId,
        lastPage: s.lastPage,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedTheme = resolve(state.themePreference);
          state.markHydrated();
        }
      },
    }
  )
);

// Keep resolvedTheme in sync with OS appearance changes when set to auto.
Appearance.addChangeListener(() => {
  const { themePreference, setThemePreference } = useSettings.getState();
  if (themePreference === 'auto') setThemePreference('auto');
});
