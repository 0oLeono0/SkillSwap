/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'app:theme';

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => initialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn('[ThemeProvider] Failed to persist theme', error);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;
    const handler = (event: MediaQueryListEvent) => {
      const stored = localStorage.getItem(THEME_KEY);
      if (!stored) setTheme(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo<ThemeContextType>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
