export interface ThemePalette {
  bg: string;
  surface: string;
  surfaceLavender: string;
  surfaceGold: string;
  borderGold: string;
  borderGreen: string;
  accent: string;
  text: string;
  textMuted: string;
  error: string;
  success: string;
  warning: string;
}

export const light: ThemePalette = {
  bg: '#FAF6EC',
  surface: '#FFFFFF',
  surfaceLavender: '#EFEAF7',
  surfaceGold: '#F6EFD8',
  borderGold: '#C9A34E',
  borderGreen: '#1B4332',
  accent: '#C9A34E',
  text: '#1B1B1B',
  textMuted: '#5B5B5B',
  error: '#B3261E',
  success: '#2E7D5B',
  warning: '#C78A1E',
};

export const dark: ThemePalette = {
  bg: '#0B1A14',
  surface: '#102820',
  surfaceLavender: '#261F3B',
  surfaceGold: '#3B3221',
  borderGold: '#D4B572',
  borderGreen: '#2E7D5B',
  accent: '#D4B572',
  text: '#F2EBD5',
  textMuted: '#B6A87B',
  error: '#E06464',
  success: '#5BCE93',
  warning: '#E8B95C',
};

export type ThemeMode = 'light' | 'dark';
