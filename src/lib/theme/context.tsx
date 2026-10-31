'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'wings_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default is strictly DARK (qora)
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((targetTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Initialize on mount: check localStorage, otherwise default to 'dark'
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initial: Theme = saved === 'light' ? 'light' : 'dark';
      setThemeState(initial);
      applyTheme(initial);
    } catch {
      applyTheme('dark');
    }
  }, [applyTheme]);

  // Set theme directly
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {}
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  // 1-click toggle directly between dark (qora) and light (oq)
  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark' as Theme,
      resolvedTheme: 'dark' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
      mounted: false,
    };
  }
  return context;
}
