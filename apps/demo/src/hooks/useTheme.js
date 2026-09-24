import { useEffect, useRef } from "react";

const STORAGE_KEY = "markify-theme";

export function useTheme() {
  const apply = (isDark) => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  };

  const toggle = () => {
    const isDark = !document.documentElement.classList.contains("dark");
    apply(isDark);
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {}
  };

  // Apply the stored theme as early as possible on mount.
  const appliedRef = useRef(false);
  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    apply(stored ? stored === "dark" : !!prefersDark);
  }, []);

  return { toggle };
}
