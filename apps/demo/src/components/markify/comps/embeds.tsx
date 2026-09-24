"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { cn } from "./_lib";

/* â”€â”€ URL parsing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export interface YouTubeVideo {
  id: string;
  start?: number;
}

/**
 * Parses a YouTube video id (and optional start timestamp) from a URL or a
 * bare video id.
 */
export function parseYouTubeId(src: string): YouTubeVideo | null {
  if (!src) return null;

  /* Bare video id form: `![youtube:dQw4w9WgXcQ]()` */
  if (!src.includes("/") && !src.includes(".")) {
    if (/^[A-Za-z0-9_-]{6,20}$/.test(src)) return { id: src };
    return null;
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (!/^(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(host)) return null;

  const path = url.pathname;
  let id: string | null = null;
  if (host === "youtu.be") {
    id = path.replace(/^\//, "").split("/")[0];
  } else if (path.startsWith("/shorts/") || path.startsWith("/embed/") || path.startsWith("/live/")) {
    id = path.split("/")[2];
  } else if (path.startsWith("/watch")) {
    id = url.searchParams.get("v");
  }
  if (!id) return null;

  const raw = url.searchParams.get("start") ?? url.searchParams.get("t");
  let start: number | undefined;
  if (raw) {
    const seconds = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(seconds) && seconds > 0) start = seconds;
  }
  return { id, start };
}

/** Parses a tweet status id from a URL or a bare numeric id. */
export function parseTweetId(src: string): string | null {
  if (!src) return null;

  /* Bare id form: `![twitter:1753387312357417123]()` */
  if (/^\d{5,25}$/.test(src.trim())) return src.trim();

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (!/^(twitter\.com|x\.com)$/.test(host)) return null;
  const match = /^\/[^/]+\/status\/(\d+)/.exec(url.pathname);
  return match ? match[1] : null;
}

/* â”€â”€ YouTube embed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function YouTubeEmbed({ src, video, streaming }: { src: string; video: YouTubeVideo; streaming?: boolean }) {
  if (streaming) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-(--markify-border) bg-(--markify-muted) px-3 py-1.5 text-xs font-medium text-(--markify-muted-fg) hover:text-(--markify-fg) transition-colors"
      >
        <Play className="size-3.5" />
        Watch on YouTube
      </a>
    );
  }
  const query = video.start ? `?start=${video.start}` : "";
  return (
    <span className="relative my-2 block aspect-video w-full overflow-hidden rounded-lg border border-(--markify-border)">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}${query}`}
        title="YouTube video player"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </span>
  );
}

/* â”€â”€ Twitter/X embed (iframe-free tweet card) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* ── Twitter/X embed (official widget, themed) ─────────────────────────── */

/** Options controlling how tweet embeds render. */
export interface TwitterEmbedOptions {
  /** ISO language code for the widget UI (e.g. "en", "de"). Default: "en". */
  lang?: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (container?: HTMLElement | null) => void };
    };
  }
}

let twitterWidgetsLoaded = false;

function ensureTwitterWidgets(): void {
  if (twitterWidgetsLoaded || (typeof window !== "undefined" && document.getElementById("twitter-wjs"))) {
    twitterWidgetsLoaded = true;
    return;
  }
  twitterWidgetsLoaded = true;
  const script = document.createElement("script");
  script.id = "twitter-wjs";
  script.async = true;
  script.src = "https://platform.x.com/widgets.js";
  document.head.appendChild(script);
}

const tweetHtmlCache = new Map<string, string>();

/** Tracks the app's dark class (the theme toggle flips documentElement). */
function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function TwitterEmbed({ src, id, streaming, options = {} }: { src: string; id: string; streaming?: boolean; options?: TwitterEmbedOptions }) {
  const isDark = useDarkMode();
  const lang = options.lang ?? "en";
  const ref = useRef<HTMLSpanElement>(null);
  const [html, setHtml] = useState<string | null>(() => tweetHtmlCache.get(`${id}:${lang}`) ?? null);
  const [failed, setFailed] = useState(false);

  /* X's official embed: fetch the oEmbed blockquote, tag it with
     data-theme / data-conversation, then let widgets.js upgrade it in place. */
  useEffect(() => {
    if (html) return;
    let cancelled = false;
    const params = new URLSearchParams({
      url: `https://x.com/i/status/${id}`,
      dnt: "true",
      omit_script: "true",
      conversation: "none",
      lang,
    });
    fetch(`https://publish.twitter.com/oembed?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((o) => {
        if (cancelled) return;
        if (typeof o?.html === "string" && o.html) {
          tweetHtmlCache.set(`${id}:${lang}`, o.html);
          setHtml(o.html);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [html, id, lang]);

  /* widgets.js styles the embed from the blockquote's data-theme attribute,
     not the oEmbed theme param — inject it here. Rebuilt on theme toggle. */
  const themedHtml = useMemo(() => {
    if (!html) return null;
    const attrs = [isDark ? 'data-theme="dark"' : "", 'data-conversation="none"'].filter(Boolean).join(" ");
    return attrs ? html.replace(/class="([^"]*twitter-tweet[^"]*)"/, (_m: string, cls: string) => `class="${cls}" ${attrs}`) : html;
  }, [html, isDark]);

  useEffect(() => {
    if (!themedHtml || typeof window === "undefined") return;
    ensureTwitterWidgets();
    let tries = 0;
    const upgrade = () => {
      if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load(ref.current);
      } else if (tries < 30) {
        tries += 1;
        setTimeout(upgrade, 100);
      }
    };
    upgrade();
  }, [themedHtml]);

  if (streaming || !themedHtml) {
    if (failed) {
      return (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--markify-border) bg-(--markify-muted) px-3 py-1.5 text-xs font-medium text-(--markify-muted-fg) hover:text-(--markify-fg) transition-colors"
        >
          View tweet on X
        </a>
      );
    }
    return (
      <span className="my-2 block w-full rounded-xl border border-(--markify-border) bg-(--markify-muted) p-6 text-sm text-(--markify-muted-fg)">
        Loading tweet…
      </span>
    );
  }

  return (
    <span
      key={isDark ? "dark" : "light"}
      ref={ref}
      className="my-2 block w-full bg-transparent [&_.twitter-tweet]:mx-auto [&_.twitter-tweet]:my-0 [&_.twitter-tweet]:w-full [&_.twitter-tweet_reply]:hidden"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: themedHtml }}
    />
  );
}

/* â”€â”€ Image (with explicit embed prefixes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export interface EmbedOptions {
  youtubeEnabled?: boolean;
  twitterEnabled?: boolean;
}

/**
 * Renders `![]()` markdown images. Embed prefixes differentiate media types:
 *
 *   ![](youtube:<url or video id>)      â†’ YouTube embed
 *   ![](twitter:<status url or id>)     â†’ X/Twitter embed
 *   ![alt](<plain url>)                 â†’ normal image
 *
 * Alt text is ignored for embeds (except in streaming mode, where it labels
 * the fallback link).
 */
export function Image({
  src,
  alt,
  title,
  youtubeEnabled = true,
  twitterEnabled = true,
  twitterOptions,
  isStreaming,
  renderers,
  className,
  ...props
}: {
  src?: string;
  alt?: string;
  title?: string;
  youtubeEnabled?: boolean;
  twitterEnabled?: boolean;
  twitterOptions?: TwitterEmbedOptions;
  isStreaming?: boolean;
  renderers?: {
    image?: (props: { src?: string; alt?: string; title?: string; [key: string]: unknown }) => ReactNode;
    youtube?: (args: { src: string; video: YouTubeVideo; isStreaming: boolean }) => ReactNode;
    twitter?: (args: { src: string; id: string; isStreaming: boolean }) => ReactNode;
  };
  className?: string;
  [key: string]: unknown;
}) {
  const raw = src ?? "";

  /* `![youtube:<url|id>]()` */
  if (raw.startsWith("youtube:")) {
    const target = raw.slice("youtube:".length).trim();
    const video = parseYouTubeId(target);
    if (video) {
      if (renderers?.youtube) return <>{renderers.youtube({ src: target, video, isStreaming: !!isStreaming })}</>;
      return <YouTubeEmbed src={target} video={video} streaming={isStreaming} />;
    }
  }

  /* `![twitter:<url|id>]()` */
  if (raw.startsWith("twitter:")) {
    const target = raw.slice("twitter:".length).trim();
    const tweetId = parseTweetId(target);
    if (tweetId) {
      if (renderers?.twitter) return <>{renderers.twitter({ src: target, id: tweetId, isStreaming: !!isStreaming })}</>;
      return <TwitterEmbed src={target} id={tweetId} streaming={isStreaming} options={twitterOptions} />;
    }
  }

  if (renderers?.image) return renderers.image({ src, alt, title, ...props });
  return (
    <img
      src={src}
      alt={alt || ""}
      title={title}
      loading="lazy"
      className={cn("inline-block max-w-full h-auto rounded-lg shadow-md align-middle my-2", className)}
      {...props}
    />
  );
}


