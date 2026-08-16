import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'markify-theme';

function getSystemTheme() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme;
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* ignore */
  }
  return 'system';
}

function applyClasses(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getInitialTheme()));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const update = () => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      applyClasses(resolved);
    };

    update();
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    if (theme === 'system') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
  }, [theme]);

  const isDark = resolvedTheme === 'dark';

  const setTheme = useCallback((next) => setThemeState(next), []);
  const toggle = useCallback(
    () => setThemeState((prev) => (resolveTheme(prev) === 'dark' ? 'light' : 'dark')),
    [],
  );

  return { theme, resolvedTheme, isDark, setTheme, toggle };
}