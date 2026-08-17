import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";

type LanguageLoader = () => Promise<{ default: LanguageFn }>;

const LANGUAGE_MAP: Record<string, { loader: LanguageLoader; aliases?: string[] }> = {
  xml: { loader: () => import("highlight.js/lib/languages/xml"), aliases: ["html"] },
  css: { loader: () => import("highlight.js/lib/languages/css"), aliases: ["less"] },
  scss: { loader: () => import("highlight.js/lib/languages/scss") },
  javascript: { loader: () => import("highlight.js/lib/languages/javascript"), aliases: ["js", "jsx"] },
  typescript: { loader: () => import("highlight.js/lib/languages/typescript"), aliases: ["ts", "tsx"] },
  python: { loader: () => import("highlight.js/lib/languages/python"), aliases: ["py"] },
  bash: { loader: () => import("highlight.js/lib/languages/bash"), aliases: ["sh", "zsh"] },
  json: { loader: () => import("highlight.js/lib/languages/json") },
  sql: { loader: () => import("highlight.js/lib/languages/sql") },
  rust: { loader: () => import("highlight.js/lib/languages/rust"), aliases: ["rs"] },
  go: { loader: () => import("highlight.js/lib/languages/go") },
  csharp: { loader: () => import("highlight.js/lib/languages/csharp"), aliases: ["cs"] },
  cpp: { loader: () => import("highlight.js/lib/languages/cpp"), aliases: ["c", "h"] },
  java: { loader: () => import("highlight.js/lib/languages/java") },
  php: { loader: () => import("highlight.js/lib/languages/php") },
  ruby: { loader: () => import("highlight.js/lib/languages/ruby"), aliases: ["rb"] },
  yaml: { loader: () => import("highlight.js/lib/languages/yaml"), aliases: ["yml"] },
  markdown: { loader: () => import("highlight.js/lib/languages/markdown"), aliases: ["md"] },
  diff: { loader: () => import("highlight.js/lib/languages/diff") },
  dart: { loader: () => import("highlight.js/lib/languages/dart") },
  kotlin: { loader: () => import("highlight.js/lib/languages/kotlin"), aliases: ["kt"] },
  swift: { loader: () => import("highlight.js/lib/languages/swift") },
  lua: { loader: () => import("highlight.js/lib/languages/lua") },
  r: { loader: () => import("highlight.js/lib/languages/r") },
  matlab: { loader: () => import("highlight.js/lib/languages/matlab") },
  perl: { loader: () => import("highlight.js/lib/languages/perl") },
  haskell: { loader: () => import("highlight.js/lib/languages/haskell"), aliases: ["hs"] },
  elixir: { loader: () => import("highlight.js/lib/languages/elixir") },
  erlang: { loader: () => import("highlight.js/lib/languages/erlang") },
  clojure: { loader: () => import("highlight.js/lib/languages/clojure") },
  scala: { loader: () => import("highlight.js/lib/languages/scala") },
  groovy: { loader: () => import("highlight.js/lib/languages/groovy") },
  objectivec: { loader: () => import("highlight.js/lib/languages/objectivec") },
  nix: { loader: () => import("highlight.js/lib/languages/nix") },
  dockerfile: { loader: () => import("highlight.js/lib/languages/dockerfile"), aliases: ["docker"] },
  makefile: { loader: () => import("highlight.js/lib/languages/makefile") },
  ini: { loader: () => import("highlight.js/lib/languages/ini") },
  http: { loader: () => import("highlight.js/lib/languages/http") },
  graphql: { loader: () => import("highlight.js/lib/languages/graphql") },
  latex: { loader: () => import("highlight.js/lib/languages/latex"), aliases: ["tex"] },
  powershell: { loader: () => import("highlight.js/lib/languages/powershell"), aliases: ["ps1"] },
  accesslog: { loader: () => import("highlight.js/lib/languages/accesslog") },
  apache: { loader: () => import("highlight.js/lib/languages/apache") },
  nginx: { loader: () => import("highlight.js/lib/languages/nginx") },
  properties: { loader: () => import("highlight.js/lib/languages/properties") },
  protobuf: { loader: () => import("highlight.js/lib/languages/protobuf") },
  vbscript: { loader: () => import("highlight.js/lib/languages/vbscript") },
  vbnet: { loader: () => import("highlight.js/lib/languages/vbnet") },
};

const loadingLanguages = new Set<string>();
const registeredLanguages = new Set<string>();

const aliasToCanonical: Record<string, string> = {};
for (const [canonical, config] of Object.entries(LANGUAGE_MAP)) {
  aliasToCanonical[canonical] = canonical;
  if (config.aliases) {
    for (const alias of config.aliases) {
      aliasToCanonical[alias] = canonical;
    }
  }
}

function getCanonicalName(lang: string): string | null {
  return aliasToCanonical[lang.toLowerCase()] ?? null;
}

async function ensureLanguage(lang: string): Promise<boolean> {
  const canonical = getCanonicalName(lang);
  if (!canonical) return false;
  if (registeredLanguages.has(canonical)) return true;
  if (loadingLanguages.has(canonical)) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (registeredLanguages.has(canonical)) resolve();
        else setTimeout(check, 10);
      };
      check();
    });
    return true;
  }

  const config = LANGUAGE_MAP[canonical];
  if (!config) return false;

  loadingLanguages.add(canonical);
  try {
    const module = await config.loader();
    hljs.registerLanguage(canonical, module.default);
    registeredLanguages.add(canonical);
    return true;
  } catch {
    return false;
  } finally {
    loadingLanguages.delete(canonical);
  }
}

const ALL_LANGUAGES = Object.keys(LANGUAGE_MAP);

const DEFAULT_LANGUAGES = [
  "xml", "css", "javascript", "typescript", "python",
  "bash", "json", "sql", "rust", "go",
  "csharp", "cpp", "java", "php", "ruby",
  "yaml", "markdown", "diff", "dart", "kotlin",
];

function preloadLanguages(langs: string[]): void {
  for (const lang of langs) {
    ensureLanguage(lang);
  }
}

export { ensureLanguage, getCanonicalName, registeredLanguages, preloadLanguages, DEFAULT_LANGUAGES, ALL_LANGUAGES };
