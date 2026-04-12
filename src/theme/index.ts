import { useSettings } from '@/store/settings';
import { dark, light, ThemePalette } from './colors';

export { typography } from './typography';
export { light, dark } from './colors';
export type { ThemePalette, ThemeMode } from './colors';

export function useThemePalette(): ThemePalette {
  const mode = useSettings((s) => s.resolvedTheme);
  return mode === 'dark' ? dark : light;
}
