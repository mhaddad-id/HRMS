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

    // Track printing state – some browsers (Chrome) temporarily toggle
    // prefers-color-scheme while the print dialog is open, which would
    // incorrectly flip the theme.
    let printing = false;
    const onBeforePrint = () => { printing = true; };
    const onAfterPrint = () => {
      printing = false;
      // Re-apply the correct theme after print finishes
      if (theme === 'system') {
        applyTheme(media.matches);
      }
    };

    const applyTheme = (dark: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(dark ? 'dark' : 'light');
      setResolved(dark ? 'dark' : 'light');
    };

    // Stable callback so removeEventListener actually removes it
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (printing) return; // Ignore changes triggered by print dialog
      applyTheme(e.matches);
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    if (theme === 'system') {
      applyTheme(media.matches);
      media.addEventListener('change', onMediaChange);
      return () => {
        media.removeEventListener('change', onMediaChange);
        window.removeEventListener('beforeprint', onBeforePrint);
        window.removeEventListener('afterprint', onAfterPrint);
      };
    }
    applyTheme(theme === 'dark');
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
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
