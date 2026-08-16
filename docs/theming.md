# Theming & Dark Mode

Markify includes built-in theme support for Light, Dark, and System modes with automatic fallback.

## 1. Class-Based Theme Toggling

Markify relies on `.dark` and `.light` CSS classes on `document.documentElement` (`<html>` element).

> [!WARNING]
> **Ensure `.light` is present in Light Mode:**  
> Markify uses `@media (prefers-color-scheme: dark) { :root:not(.light) { ... } }` as a system dark fallback. When switching your app to Light Mode, your theme provider **MUST add `.light`** (or toggle `.light`, `!isDark`) to prevent OS dark mode from forcing dark text onto light backgrounds.

### Recommended Theme Provider Implementation

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";

    const activeTheme = isDark ? "dark" : "light";
    setResolvedTheme(activeTheme);

    // Toggle both classes cleanly
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.setAttribute("data-theme", activeTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 2. Code Block Theme Sync (`hljsTheme`)

Synchronize code syntax highlighting with your application theme by passing the `hljsTheme` prop:

```tsx
import { Markify } from "@glitchoff/markify";
import { useTheme } from "./context/ThemeContext";

export function MarkdownViewer({ markdown }: { markdown: string }) {
  const { resolvedTheme } = useTheme();

  return (
    <Markify hljsTheme={resolvedTheme === "dark" ? "dark" : "light"}>
      {markdown}
    </Markify>
  );
}
```

### Custom hljs CSS / External Themes
You can also supply raw inline CSS or an external CSS file URL for syntax highlighting:

```tsx
// Raw CSS override
<Markify hljsCustomCss=".hljs { color: #fff; background: #111; }">
  {markdown}
</Markify>

// External theme stylesheet
<Markify hljsThemeUrl={isDark ? "/themes/rose-pine.css" : "/themes/rose-pine-dawn.css"}>
  {markdown}
</Markify>
```
