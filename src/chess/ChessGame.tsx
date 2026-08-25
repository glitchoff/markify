"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Copy,
  Check,
  Download,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "../utils";
import { markifyThemeProps, type MarkifyTheme, type MarkifyThemePreset } from "../theme";

export interface ChessGameProps {
  pgn: string;
  className?: string;
  showNotation?: boolean;
  isStreaming?: boolean;
  /** Which host-app token vocabulary the `--markify-*` aliases resolve to. Defaults to `"shadcn"`. */
  themeType?: MarkifyThemePreset;
  /** Per-instance token overrides. */
  theme?: Partial<MarkifyTheme>;
  /** Escape hatch for setting raw `--markify-*` custom properties directly. */
  cssVars?: Record<string, string>;
}

type PlyInfo = {
  san: string;
  from: string;
  to: string;
  /** NAG glyphs, e.g. ["!", "?!"] */
  nags: string[];
  commentBefore?: string;
  commentAfter?: string;
};

// ---------------------------------------------------------------------------
// PGN movetext parsing (comments, NAGs). Variations are skipped.
// ---------------------------------------------------------------------------

type Token =
  | { type: "move"; v: string }
  | { type: "comment"; v: string }
  | { type: "nag"; v: string }
  | { type: "open" }
  | { type: "close" }
  | { type: "result"; v: string };

const NAG_GLYPHS: Record<string, string> = {
  "1": "!",
  "2": "?",
  "3": "!!",
  "4": "??",
  "5": "!?",
  "6": "?!",
  "7": "□",
  "10": "=",
  "13": "∞",
  "14": "⩲",
  "15": "⩱",
  "16": "±",
  "17": "∓",
  "18": "+−",
  "19": "−+",
  "22": "⨀",
  "36": "→",
  "40": "↑",
  "44": "⇆",
};

function nagGlyph(nag: string): string {
  return NAG_GLYPHS[nag] ?? `$${nag}`;
}

function tokenizeMovetext(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "{") {
      const j = text.indexOf("}", i + 1);
      tokens.push({ type: "comment", v: text.slice(i + 1, j < 0 ? text.length : j).trim() });
      i = j < 0 ? text.length : j + 1;
    } else if (c === ";") {
      const j = text.indexOf("\n", i);
      tokens.push({ type: "comment", v: text.slice(i + 1, j < 0 ? text.length : j).trim() });
      i = j < 0 ? text.length : j + 1;
    } else if (c === "(") {
      tokens.push({ type: "open" });
      i++;
    } else if (c === ")") {
      tokens.push({ type: "close" });
      i++;
    } else if (c === "$") {
      const m = /^\$(\d+)/.exec(text.slice(i));
      if (m) {
        tokens.push({ type: "nag", v: m[1] });
        i += m[0].length;
      } else i++;
    } else if (/\s/.test(c)) {
      i++;
    } else {
      const m = /^[^\s(){};]+/.exec(text.slice(i))!;
      const word = m[0];
      i += word.length;
      // Skip move numbers like "12." / "12..." and result tokens.
      if (/^\d+\.+$/.test(word)) continue;
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(word)) {
        tokens.push({ type: "result", v: word });
        continue;
      }
      tokens.push({ type: "move", v: word });
    }
  }
  return tokens;
}

/**
 * Parses the mainline moves. Anything inside `(...)` variations is skipped
 * entirely — only the principal variation is kept.
 */
function readLine(tokens: Token[], i: number, board: Chess): { plies: PlyInfo[]; i: number } {
  const plies: PlyInfo[] = [];
  let pendingComment: string | undefined;
  let depth = 0;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t.type === "open") {
      depth++;
      i++;
      continue;
    }
    if (t.type === "close") {
      if (depth > 0) depth--;
      i++;
      continue;
    }
    if (depth > 0) {
      i++;
      continue;
    }
    if (t.type === "result") {
      i++;
      continue;
    }
    if (t.type === "comment") {
      pendingComment = t.v || undefined;
      i++;
      continue;
    }

    // Move token
    let mv: ReturnType<Chess["move"]> | undefined;
    try {
      mv = board.move(t.v);
    } catch {
      /* tolerate illegal/unparseable SAN in lenient mode */
    }
    const ply: PlyInfo = {
      san: mv?.san ?? t.v,
      from: mv?.from ?? "",
      to: mv?.to ?? "",
      nags: [],
      commentBefore: pendingComment,
      commentAfter: undefined,
    };
    pendingComment = undefined;
    i++;

    while (i < tokens.length && tokens[i].type === "nag") {
      ply.nags.push(nagGlyph((tokens[i] as Extract<Token, { type: "nag" }>).v));
      i++;
    }
    while (i < tokens.length && tokens[i].type === "comment") {
      const cv = (tokens[i] as Extract<Token, { type: "comment" }>).v;
      ply.commentAfter = ply.commentAfter ? `${ply.commentAfter} ${cv}` : cv;
      i++;
    }

    plies.push(ply);
  }

  return { plies, i };
}

function parsePgn(pgn: string, isStreaming: boolean): { plies: PlyInfo[]; headers: Record<string, string>; error: string | null; loading: boolean } {
  // While streaming, wait for the full game before rendering; incomplete
  // PGN is ambiguous and would flicker the board / status between tokens.
  if (isStreaming) return { plies: [], headers: {}, error: null, loading: true };

  const headers: Record<string, string> = {};
  let body = pgn.replace(/^\s+/, "");

  const headerBlock = /^(?:\[[^\]]+\]\s*\r?\n)+/.exec(body);
  if (headerBlock) {
    const tagRe = /\[(\w+)\s+"([^"]*)"\]/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(headerBlock[0]))) {
      headers[m[1]] = m[2];
    }
    body = body.slice(headerBlock[0].length);
  }

  const tokens = tokenizeMovetext(body);
  const plies = readLine(tokens, 0, new Chess()).plies;
  const error = plies.length === 0 && body.trim().length > 0 ? "Invalid PGN" : null;

  return { plies, headers, error, loading: false };
}

function fenAt(plies: PlyInfo[], upTo: number): string {
  const g = new Chess();
  for (let i = 0; i < upTo; i++) {
    const p = plies[i];
    try {
      g.move({ from: p.from, to: p.to, promotion: "q" });
    } catch {
      try {
        g.move(p.san);
      } catch {
        /* skip */
      }
    }
  }
  return g.fen();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ChessGameInner({ pgn, className, showNotation = true, isStreaming = false, themeType, theme, cssVars }: ChessGameProps) {
  const themeAttrs = markifyThemeProps(themeType, theme);
  const { plies, headers, error, loading } = useMemo(() => parsePgn(pgn, isStreaming), [pgn, isStreaming]);

  const [currentPly, setCurrentPly] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [copied, setCopied] = useState(false);

  // Mobile horizontal move strip; kept scrolled to the active move so it
  // stays in sync with the nav buttons / slider / keyboard.
  const moveStripRef = useRef<HTMLDivElement>(null);

  const total = plies.length;

  const currentFen = useMemo(() => {
    if (total === 0) return new Chess().fen();
    return fenAt(plies, currentPly);
  }, [plies, currentPly, total]);

  const { sideToMove, inCheck, isOver, result } = useMemo(() => {
    const g = new Chess(currentFen);
    const over = g.isGameOver();
    let res = "";
    if (g.isCheckmate()) res = g.turn() === "w" ? "Black wins" : "White wins";
    else if (g.isStalemate()) res = "Stalemate";
    else if (g.isThreefoldRepetition()) res = "Draw (repetition)";
    else if (g.isInsufficientMaterial()) res = "Draw (insufficient material)";
    else if (g.isDraw()) res = "Draw";
    return {
      sideToMove: g.turn(),
      inCheck: g.inCheck(),
      isOver: over,
      result: res,
    };
  }, [currentFen]);

  // Highlight the move that led to the current position.
  const lastMoveSquareStyles = useMemo(() => {
    if (currentPly === 0) return {};
    const p = plies[currentPly - 1];
    if (!p?.from) return {};
    return {
      [p.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      [p.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    };
  }, [plies, currentPly]);

  const goTo = useCallback((ply: number) => {
    setCurrentPly(Math.max(0, Math.min(total, ply)));
  }, [total]);

  // When a new game finishes loading, jump to the final position so the
  // board shows the result of the game instead of the empty start.
  useEffect(() => {
    if (total > 0) setCurrentPly(total);
  }, [total]);

  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(total), [goTo, total]);
  const goPrev = useCallback(() => goTo(currentPly - 1), [goTo, currentPly]);
  const goNext = useCallback(() => goTo(currentPly + 1), [goTo, currentPly]);

  const handleFlip = useCallback(() => {
    setOrientation((o) => (o === "white" ? "black" : "white"));
  }, []);

  // Keyboard navigation: ← → step, Home/End jump, f flips board.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "Home":
          e.preventDefault();
          goFirst();
          break;
        case "End":
          e.preventDefault();
          goLast();
          break;
        case "f":
        case "F":
          handleFlip();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goFirst, goLast, handleFlip]);

  // Keep the mobile move strip scrolled so the active move stays in view.
  useEffect(() => {
    const strip = moveStripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const sRect = strip.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const left = strip.scrollLeft + aRect.left - sRect.left - strip.clientWidth / 2 + aRect.width / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [currentPly]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pgn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = pgn;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pgn]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      (headers["White"] && headers["Black"]
        ? `${headers["White"].replace(/\W+/g, "-")}-vs-${headers["Black"].replace(/\W+/g, "-")}`
        : "game") + ".pgn";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pgn, headers]);

  const whiteName = headers["White"];
  const blackName = headers["Black"];
  const event = headers["Event"];
  const score = headers["Result"];

  const statusText =
    result ||
    (inCheck
      ? `${sideToMove === "w" ? "White" : "Black"} is in check`
      : isOver
        ? "Game over"
        : `${sideToMove === "w" ? "White" : "Black"} to move`);

  /**
   * Mobile horizontal scroller: a single flowing row of moves (chess.com style).
   * Move numbers prefix white moves; comments render as subtle inline italics.
   */
  const renderPlies = (list: PlyInfo[], offset: number): React.ReactNode =>
    list.map((ply, idx) => {
      const globalIdx = offset + idx;
      const isWhite = globalIdx % 2 === 0;
      const active = currentPly === globalIdx + 1;
      return (
        <Fragment key={`${globalIdx}-${ply.san}`}>
          <span className="inline-flex items-baseline gap-0.5">
            {isWhite && (
              <span className="select-none font-mono text-[0.7em] text-muted-foreground">
                {Math.floor(globalIdx / 2) + 1}.
              </span>
            )}
            <button
              onClick={() => goTo(globalIdx + 1)}
              data-active={active || undefined}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1 transition-colors",
                active
                  ? "bg-primary/15 font-medium text-primary"
                  : "font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
              )}
              type="button"
            >
              {ply.san}
              {ply.nags.length > 0 && (
                <span className="ml-0.5 text-[0.85em] text-emerald-600 dark:text-emerald-400">{ply.nags.join("")}</span>
              )}
            </button>
          </span>
          {ply.commentAfter && (
            <span className="text-[0.7em] italic text-muted-foreground/70">— {ply.commentAfter}</span>
          )}
        </Fragment>
      );
    });

  /**
   * Desktop move list: the classic 3-column score-sheet grid (number | white
   * | black). Comments render as a muted indented line beneath their move.
   */
  const renderGrid = (list: PlyInfo[], offset: number): React.ReactNode => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < list.length; i += 2) {
      const white = list[i];
      const black = list[i + 1];
      rows.push(
        <Fragment key={`row-${i}`}>
          <span className="select-none py-0.5 pr-1 text-right font-mono text-xs text-muted-foreground">
            {i / 2 + 1}.
          </span>
          {white ? renderGridCell(white, offset + i) : <span />}
          {black ? renderGridCell(black, offset + i + 1) : <span />}
          {white?.commentAfter && (
            <p className="col-span-3 pl-7 text-xs italic text-muted-foreground/70">{white.commentAfter}</p>
          )}
          {black?.commentAfter && (
            <p className="col-span-3 pl-7 text-xs italic text-muted-foreground/70">{black.commentAfter}</p>
          )}
        </Fragment>,
      );
    }
    return rows;
  };

  const renderGridCell = (ply: PlyInfo, globalIdx: number) => {
    const active = currentPly === globalIdx + 1;
    return (
      <button
        onClick={() => goTo(globalIdx + 1)}
        className={cn(
          "cursor-pointer rounded px-1.5 py-0.5 text-left transition-colors",
          active
            ? "bg-primary/15 font-medium text-primary"
            : "text-foreground/80 hover:bg-muted hover:text-foreground",
        )}
        type="button"
      >
        {ply.san}
        {ply.nags.length > 0 && (
          <span className="ml-0.5 text-[0.85em] text-emerald-600 dark:text-emerald-400">{ply.nags.join("")}</span>
        )}
      </button>
    );
  };

  // Chess.com mobile style: the board spans the full card width with no
  // padding around it; controls dock directly beneath it.
  const boardArea = (
    <div className="mx-auto min-w-0 w-full shrink-0 sm:max-w-[420px] sm:px-4 sm:pt-4">
      <Chessboard
        options={{
          position: currentFen,
          boardOrientation: orientation,
          allowDragging: false,
          allowDrawingArrows: true,
          showNotation,
          squareStyles: lastMoveSquareStyles,
        }}
      />
    </div>
  );

  const controlsArea = (
    <div className="flex min-w-0 w-full flex-col justify-between gap-2 sm:w-auto sm:flex-1 sm:gap-3">
      {total === 0 ? (
        <p className="p-2 text-sm text-muted-foreground">No moves in this game.</p>
      ) : (
        <>
          {/* Mobile: horizontal scrolling move strip (chess.com style). */}
          <div
            ref={moveStripRef}
            className="flex items-center gap-x-1 overflow-x-auto rounded-md border border-border p-2 [scrollbar-width:thin] sm:hidden"
          >
            <div className="flex w-max items-center gap-x-1 whitespace-nowrap text-[13px]">
              {renderPlies(plies, 0)}
            </div>
          </div>
          {/* Desktop: classic score-sheet grid. */}
          <div className="hidden max-h-[260px] overflow-y-auto rounded-md border border-border p-2 [scrollbar-width:thin] sm:grid sm:grid-cols-[auto_1fr_1fr] sm:gap-x-2 sm:gap-y-0.5 sm:text-sm">
            {renderGrid(plies, 0)}
          </div>
        </>
      )}

      <div className="flex items-center justify-center gap-1.5">
        <NavButton onClick={goFirst} disabled={currentPly === 0} title="First move (Home)">
          <ChevronFirst className="size-4" />
        </NavButton>
        <NavButton onClick={goPrev} disabled={currentPly === 0} title="Previous move (←)">
          <ChevronLeft className="size-4" />
        </NavButton>
        <NavButton onClick={goNext} disabled={currentPly >= total} title="Next move (→)">
          <ChevronRight className="size-4" />
        </NavButton>
        <NavButton onClick={goLast} disabled={currentPly >= total} title="Last move (End)">
          <ChevronLast className="size-4" />
        </NavButton>
        <NavButton onClick={handleFlip} title={`Flip board (F)`}>
          <RotateCcw className="size-4" />
        </NavButton>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {currentPly}/{total}
        </span>
        <input
          type="range"
          min={0}
          max={total}
          value={currentPly}
          onChange={(e) => goTo(Number(e.target.value))}
          className="min-w-0 flex-1 cursor-pointer accent-primary"
          aria-label="Move slider"
        />
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-center text-xs text-muted-foreground">
        {statusText}
      </div>
    </div>
  );

  return (
    <div
      {...themeAttrs}
      className={cn(
        "markify-root relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden rounded-lg border border-border bg-card flex flex-col",
        className,
      )}
      style={{ ...themeAttrs.style, ...cssVars }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs font-medium text-muted-foreground">chess</span>
          {(whiteName || blackName) && (
            <span className="hidden min-w-0 truncate text-xs text-foreground/70 sm:inline">
              {whiteName || "White"} vs {blackName || "Black"}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <HeaderButton onClick={handleCopy} title={copied ? "Copied" : "Copy PGN"} active={copied}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </HeaderButton>
          <HeaderButton onClick={handleDownload} title="Download PGN">
            <Download className="size-4" />
          </HeaderButton>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Waiting for the game to finish streaming…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <pre className="mt-2 max-h-48 w-full overflow-auto rounded bg-muted p-3 text-left text-xs">
            <code>{pgn}</code>
          </pre>
        </div>
      ) : (
        <>
          {(event || whiteName || blackName || score) && (
            <div className="border-b border-border px-3 py-2 sm:px-4">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-foreground">{whiteName || "White"}</span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="font-semibold text-foreground">{blackName || "Black"}</span>
                  {score && <span className="text-xs text-muted-foreground">({score})</span>}
                </div>
                {event && <span className="text-xs text-muted-foreground">{event}</span>}
              </div>
            </div>
          )}

          <div className="flex min-h-0 flex-col gap-2 p-0 sm:gap-3 sm:p-4 lg:flex-row lg:items-start">
            {boardArea}
            {controlsArea}
          </div>
        </>
      )}
    </div>
  );
}

function HeaderButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 py-1.5 transition-colors",
        active
          ? "bg-emerald-500/20 text-emerald-400"
          : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9",
        "hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export const ChessGame = memo(ChessGameInner);
