'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'dark' | 'light';
} | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'hrms-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolved, setResolved] = React.useState<'dark' | 'light'>('light');

  React.useEffect(() => {
    const stored = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    setThemeState(stored);
  }, [defaultTheme, storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (dark: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(dark ? 'dark' : 'light');
      setResolved(dark ? 'dark' : 'light');
    };
    if (theme === 'system') {
      apply(media.matches);
      media.addEventListener('change', (e) => apply(e.matches));
      return () => media.removeEventListener('change', (e) => apply(e.matches));
    }
    apply(theme === 'dark');
  }, [theme]);

  const setTheme = React.useCallback(
    (t: Theme) => {
      localStorage.setItem(storageKey, t);
      setThemeState(t);
    },
    [storageKey]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
