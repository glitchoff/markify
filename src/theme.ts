import type { CSSProperties } from "react";

/**
 * Theme presets map a host app's design-token vocabulary onto Markify's
 * scoped `--markify-*` custom properties (see src/themes/aliases.css).
 *
 * - `"shadcn"` (default) — standard shadcn tokens (`--background`, `--card`,
 *   `--muted`, `--border`, …). Covers next-themes / shadcn apps.
 * - `"daisyui"` — daisyUI v5 tokens (`--color-base-100`, `--color-primary`, …).
 * - `"radix"` — Radix Themes v3 tokens (`--color-background`, `--gray-*`,
 *   `--accent-*`, …).
 * - `"bootstrap"` — Bootstrap 5 CSS variables (`--bs-body-bg`, `--bs-primary`, …).
 * - `"none"` — no indirection; Markify's built-in neutral palette.
 */
export type MarkifyThemePreset =
  | "shadcn"
  | "daisyui"
  | "radix"
  | "bootstrap"
  | "none";

/** Per-instance overrides for any markify token. Values are CSS values. */
export interface MarkifyTheme {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  radius?: string;
  fontSans?: string;
  fontMono?: string;
}

/** Maps `MarkifyTheme` keys to the `--markify-*` custom properties. */
export const MARKIFY_VAR_MAP: Record<keyof MarkifyTheme, string> = {
  background: "--markify-bg",
  foreground: "--markify-fg",
  card: "--markify-card",
  cardForeground: "--markify-card-fg",
  popover: "--markify-popover",
  popoverForeground: "--markify-popover-fg",
  primary: "--markify-primary",
  primaryForeground: "--markify-primary-fg",
  secondary: "--markify-secondary",
  secondaryForeground: "--markify-secondary-fg",
  muted: "--markify-muted",
  mutedForeground: "--markify-muted-fg",
  accent: "--markify-accent",
  accentForeground: "--markify-accent-fg",
  destructive: "--markify-destructive",
  destructiveForeground: "--markify-destructive-fg",
  border: "--markify-border",
  input: "--markify-input",
  ring: "--markify-ring",
  radius: "--markify-radius",
  fontSans: "--markify-font-sans",
  fontMono: "--markify-font-mono",
};

/** Converts a partial `MarkifyTheme` into inline `--markify-*` vars. */
export function toMarkifyVars(theme?: Partial<MarkifyTheme>): CSSProperties {
  const vars: Record<string, string> = {};
  if (!theme) return vars;
  for (const key of Object.keys(theme) as (keyof MarkifyTheme)[]) {
    const value = theme[key];
    if (value === undefined) continue;
    vars[MARKIFY_VAR_MAP[key]] = value;
  }
  return vars;
}

/**
 * Shared theming attrs for standalone Markify components (MermaidBlock,
 * ChessGame, FenBoard) that render outside a `<Markify>` wrapper. Spread
 * onto the component root so the `--markify-*` aliases and the scoped
 * utility layer in core.css apply.
 */
export function markifyThemeProps(
  themeType?: MarkifyThemePreset,
  theme?: Partial<MarkifyTheme>,
) {
  return {
    "data-theme-type": themeType ?? "shadcn",
    style: toMarkifyVars(theme),
  } as const;
}