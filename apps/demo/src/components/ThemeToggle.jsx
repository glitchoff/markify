"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { toggle } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <button
      onClick={toggle}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors sm:px-2.5"
      type="button"
      title="Toggle dark / light mode"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      <span className="hidden sm:block">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeToggle;
