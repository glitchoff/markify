// Site base path ("/markify" on GitHub Pages, "" on a root domain).
const raw = import.meta.env.BASE_URL ?? "/";
export const BASE = raw.endsWith("/") ? raw.slice(0, -1) : raw;

/** Prefix an internal "/"-rooted path with the site base. */
export function withBase(path) {
  if (!path?.startsWith("/")) return path;
  return `${BASE}${path}`;
}
