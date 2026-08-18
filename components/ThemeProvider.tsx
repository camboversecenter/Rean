import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Shared with the inline boot script in index.html. Keep the two in step. */
export const THEME_STORAGE_KEY = 'rean-theme';

/**
 * Light is the product default. The system preference is deliberately ignored:
 * a learner whose phone is set to dark still gets the light interface until
 * they choose otherwise, which is what was asked for.
 */
export const DEFAULT_THEME: Theme = 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** Reads the saved choice. Falls back to light for a first visit, a cleared
 *  store, or a value corrupted by hand. */
export const readStoredTheme = (): Theme => {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : DEFAULT_THEME;
  } catch {
    // Safari in private mode throws on localStorage access rather than
    // returning null, and a theme is never worth breaking the app over.
    return DEFAULT_THEME;
  }
};

/** Tailwind is configured with darkMode:'class', so this class on <html> is
 *  what every dark: variant keys off. */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === 'undefined' ? DEFAULT_THEME : readStoredTheme()
  );

  // The boot script in index.html has already applied the class, so this is
  // only doing work on later changes. Running it once on mount also keeps the
  // DOM correct if that script was stripped or failed.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference will not survive a reload, but the session still works.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Follow the preference across tabs, so toggling in one does not leave
  // another showing the old theme.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isTheme(e.newValue)) setThemeState(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
};

export default ThemeProvider;
