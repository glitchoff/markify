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
  Eye,
  Code2,
} from "lucide-react";
import { cn, copyToClipboard, downloadText } from "./_lib";

/* ═══════════════════════════════════════════════════════════════════════
 * PGN game viewer
 * ═══════════════════════════════════════════════════════════════════════ */

export interface ChessGameProps {
  pgn: string;
  className?: string;
  showNotation?: boolean;
  isStreaming?: boolean;
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

/* PGN movetext parsing (comments, NAGs). Variations are skipped. */

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

/** Parses the mainline moves. Variations inside `(...)` are skipped. */
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
  /* While streaming, wait for the full game before rendering. */
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

function ChessGameInner({ pgn, className, showNotation = true, isStreaming = false }: ChessGameProps) {
  const { plies, headers, error, loading } = useMemo(() => parsePgn(pgn, isStreaming), [pgn, isStreaming]);

  const [currentPly, setCurrentPly] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [copied, setCopied] = useState(false);

  /* Mobile horizontal move strip; kept scrolled to the active move. */
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

  /* Highlight the move that led to the current position. */
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

  /* Jump to the final position once the game finishes streaming. */
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

  /* Keyboard navigation: ← → step, Home/End jump, f flips board. */
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

  /* Keep the mobile move strip scrolled to the active move. */
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
    if (await copyToClipboard(pgn)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pgn]);

  const handleDownload = useCallback(() => {
    const filename =
      (headers["White"] && headers["Black"]
        ? `${headers["White"].replace(/\W+/g, "-")}-vs-${headers["Black"].replace(/\W+/g, "-")}`
        : "game") + ".pgn";
    downloadText(pgn, filename);
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

  /* Mobile horizontal scroller: a single flowing row of moves. */
  const renderPlies = (list: PlyInfo[], offset: number): React.ReactNode =>
    list.map((ply, idx) => {
      const globalIdx = offset + idx;
      const isWhite = globalIdx % 2 === 0;
      const active = currentPly === globalIdx + 1;
      return (
        <Fragment key={`${globalIdx}-${ply.san}`}>
          <span className="inline-flex items-baseline gap-0.5">
            {isWhite && (
              <span className="select-none font-mono text-[0.7em] text-(--markify-muted-fg)">
                {Math.floor(globalIdx / 2) + 1}.
              </span>
            )}
            <button
              onClick={() => goTo(globalIdx + 1)}
              data-active={active || undefined}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1 transition-colors",
                active
                  ? "bg-(--markify-primary-15) font-medium text-(--markify-primary)"
                  : "font-medium text-(--markify-fg-80) hover:bg-(--markify-muted) hover:text-(--markify-fg)",
              )}
              type="button"
            >
              {ply.san}
              {ply.nags.length > 0 && (
                <span className="ml-0.5 text-[0.85em] text-(--markify-success)">{ply.nags.join("")}</span>
              )}
            </button>
          </span>
          {ply.commentAfter && (
            <span className="text-[0.7em] italic text-(--markify-muted-fg-70)">— {ply.commentAfter}</span>
          )}
        </Fragment>
      );
    });

  /* Desktop move list: classic 3-column score-sheet grid. */
  const renderGrid = (list: PlyInfo[], offset: number): React.ReactNode => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < list.length; i += 2) {
      const white = list[i];
      const black = list[i + 1];
      rows.push(
        <Fragment key={`row-${i}`}>
          <span className="select-none py-0.5 pr-1 text-right font-mono text-xs text-(--markify-muted-fg)">
            {i / 2 + 1}.
          </span>
          {white ? renderGridCell(white, offset + i) : <span />}
          {black ? renderGridCell(black, offset + i + 1) : <span />}
          {white?.commentAfter && (
            <p className="col-span-3 pl-7 text-xs italic text-(--markify-muted-fg-70)">{white.commentAfter}</p>
          )}
          {black?.commentAfter && (
            <p className="col-span-3 pl-7 text-xs italic text-(--markify-muted-fg-70)">{black.commentAfter}</p>
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
            ? "bg-(--markify-primary-15) font-medium text-(--markify-primary)"
            : "text-(--markify-fg-80) hover:bg-(--markify-muted) hover:text-(--markify-fg)",
        )}
        type="button"
      >
        {ply.san}
        {ply.nags.length > 0 && (
          <span className="ml-0.5 text-[0.85em] text-(--markify-success)">{ply.nags.join("")}</span>
        )}
      </button>
    );
  };

  /* The board spans the full card width; controls dock beneath it. */
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
        <p className="p-2 text-sm text-(--markify-muted-fg)">No moves in this game.</p>
      ) : (
        <>
          {/* Mobile: horizontal scrolling move strip. */}
          <div
            ref={moveStripRef}
            className="flex items-center gap-x-1 overflow-x-auto rounded-md border border-(--markify-border) p-2 [scrollbar-width:thin] sm:hidden"
          >
            <div className="flex w-max items-center gap-x-1 whitespace-nowrap text-[13px]">
              {renderPlies(plies, 0)}
            </div>
          </div>
          {/* Desktop: classic score-sheet grid. */}
          <div className="hidden max-h-[260px] overflow-y-auto rounded-md border border-(--markify-border) p-2 [scrollbar-width:thin] sm:grid sm:grid-cols-[auto_1fr_1fr] sm:gap-x-2 sm:gap-y-0.5 sm:text-sm">
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
        <NavButton onClick={handleFlip} title="Flip board (F)">
          <RotateCcw className="size-4" />
        </NavButton>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-xs text-(--markify-muted-fg)">
          {currentPly}/{total}
        </span>
        <input
          type="range"
          min={0}
          max={total}
          value={currentPly}
          onChange={(e) => goTo(Number(e.target.value))}
          className="min-w-0 flex-1 cursor-pointer accent-(--markify-primary)"
          aria-label="Move slider"
        />
      </div>

      <div className="rounded-md border border-(--markify-border) bg-(--markify-muted-40) px-3 py-1.5 text-center text-xs text-(--markify-muted-fg)">
        {statusText}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "markify-chess relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden rounded-lg border border-(--markify-border) bg-(--markify-card) flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--markify-border) bg-(--markify-muted) px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs font-medium text-(--markify-muted-fg)">chess</span>
          {(whiteName || blackName) && (
            <span className="hidden min-w-0 truncate text-xs text-(--markify-fg-70) sm:inline">
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
        <div className="flex items-center gap-2 p-6 text-sm text-(--markify-muted-fg)">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-(--markify-border) border-t-(--markify-fg)" />
          Waiting for the game to finish streaming…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-sm text-(--markify-destructive)">{error}</p>
          <pre className="mt-2 max-h-48 w-full overflow-auto rounded bg-(--markify-muted) p-3 text-left text-xs">
            <code>{pgn}</code>
          </pre>
        </div>
      ) : (
        <>
          {(event || whiteName || blackName || score) && (
            <div className="border-b border-(--markify-border) px-3 py-2 sm:px-4">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-(--markify-fg)">{whiteName || "White"}</span>
                  <span className="text-xs text-(--markify-muted-fg)">vs</span>
                  <span className="font-semibold text-(--markify-fg)">{blackName || "Black"}</span>
                  {score && <span className="text-xs text-(--markify-muted-fg)">({score})</span>}
                </div>
                {event && <span className="text-xs text-(--markify-muted-fg)">{event}</span>}
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
          ? "bg-(--markify-success-20) text-(--markify-success)"
          : "text-(--markify-muted-fg) hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg)",
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
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-(--markify-border) text-(--markify-muted-fg) transition-colors sm:h-9 sm:w-9",
        "hover:bg-(--markify-accent) hover:text-(--markify-fg) disabled:cursor-not-allowed disabled:opacity-40",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export const ChessGame = memo(ChessGameInner);

/* ═══════════════════════════════════════════════════════════════════════
 * FEN board viewer
 * ═══════════════════════════════════════════════════════════════════════ */

export interface FenBoardProps {
  fen: string;
  className?: string;
  showNotation?: boolean;
  isStreaming?: boolean;
  /** Max board width in px. The card shrinks to fit. */
  maxWidth?: number;
}

function FenBoardInner({ fen, className, showNotation = true, isStreaming = false, maxWidth = 420 }: FenBoardProps) {
  const [preview, setPreview] = useState(true);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseFen(fen, isStreaming), [fen, isStreaming]);

  /* Live, playable game state; reset restores the original position. */
  const [game, setGame] = useState<Chess | null>(null);

  useEffect(() => {
    if (parsed.error || parsed.streaming) {
      setGame(null);
      return;
    }
    setGame(new Chess(parsed.fen));
    setMovesPlayed(0);
  }, [parsed.fen, parsed.error, parsed.streaming]);

  const playable = game !== null;
  const [movesPlayed, setMovesPlayed] = useState(0);

  const [selected, setSelected] = useState<string | null>(null);

  /* Click-to-move: select a piece, then click a destination. */
  const handleSquareClick = useCallback(({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
    if (!game) return;
    if (selected === null) {
      if (piece) setSelected(square);
      return;
    }
    if (selected === square) {
      setSelected(null);
      return;
    }
    const ng = new Chess(game.fen());
    try {
      ng.move({ from: selected, to: square, promotion: "q" });
    } catch {
      if (piece) setSelected(square);
      else setSelected(null);
      return;
    }
    setGame(ng);
    setSelected(null);
    setMovesPlayed((n) => n + 1);
  }, [game, selected]);

  /* Highlight selected square + legal target squares. */
  const squareStyles = useMemo(() => {
    if (!game || !selected) return {};
    const styles: Record<string, React.CSSProperties> = {
      [selected]: { background: "rgba(20, 130, 240, 0.35)" },
    };
    const g = new Chess(game.fen());
    const moves = g.moves({ square: selected as any, verbose: true });
    for (const m of moves) {
      styles[m.to] = { background: "radial-gradient(circle, rgba(20,130,240,0.3) 25%, transparent 25%)" };
    }
    return styles;
  }, [game, selected]);

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }) => {
    if (!game || !targetSquare) return false;
    const ng = new Chess(game.fen());
    try {
      ng.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    setGame(ng);
    setSelected(null);
    setMovesPlayed((n) => n + 1);
    return true;
  }, [game]);

  const handleReset = useCallback(() => {
    if (parsed.error || parsed.streaming) return;
    setGame(new Chess(parsed.fen));
    setSelected(null);
    setMovesPlayed(0);
  }, [parsed.fen, parsed.error, parsed.streaming]);

  const liveLabel = useMemo(() => {
    if (!game) return parsed.streaming ? "" : parsed.label;
    const turn = game.turn() === "w" ? "White" : "Black";
    if (game.isCheckmate()) return `Checkmate: ${game.turn() === "w" ? "Black" : "White"} wins`;
    if (game.isStalemate()) return "Stalemate";
    if (game.isThreefoldRepetition()) return "Draw (repetition)";
    if (game.isInsufficientMaterial()) return "Draw (insufficient material)";
    if (game.isDraw()) return "Draw";
    if (game.isGameOver()) return "Game over";
    if (game.inCheck()) return `${turn} is in check`;
    return `${turn} to move`;
  }, [game, parsed.streaming, parsed.label]);

  const positionFen = game ? game.fen() : parsed.fen;

  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(fen)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fen]);

  return (
    <div
      className={cn(
        "markify-fen relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden rounded-lg border border-(--markify-border) bg-(--markify-card) flex flex-col w-full min-w-0",
        className,
      )}
      style={{ maxWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-(--markify-border) bg-(--markify-muted) px-2.5 py-1.5 sm:px-3">
        <span className="font-mono text-xs font-medium text-(--markify-muted-fg)">fen</span>
        <div className="flex gap-0.5 sm:gap-1">
          <button
            onClick={() => setPreview((p) => !p)}
            title={preview ? "Show code" : "Show board"}
            className="flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 text-(--markify-muted-fg) transition-colors hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg) sm:min-h-8 sm:min-w-8 sm:px-2"
            type="button"
          >
            {preview ? <Code2 className="size-4" /> : <Eye className="size-4" />}
          </button>
          <button
            onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
            title="Flip board"
            className="flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 text-(--markify-muted-fg) transition-colors hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg) sm:min-h-8 sm:min-w-8 sm:px-2"
            type="button"
          >
            <span className="text-xs font-bold">⇅</span>
          </button>
          <button
            onClick={handleReset}
            disabled={!playable || movesPlayed === 0}
            title={movesPlayed === 0 ? "No moves played" : `Reset to starting position (${movesPlayed} move${movesPlayed === 1 ? "" : "s"} played)`}
            className={cn(
              "relative flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-8 sm:min-w-8 sm:px-2",
              movesPlayed > 0
                ? "text-(--markify-danger) hover:bg-(--markify-danger-10)"
                : "text-(--markify-muted-fg) hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg)",
            )}
            type="button"
          >
            <RotateCcw className="size-4" />
            {movesPlayed > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--markify-danger) px-1 text-[10px] font-semibold leading-none text-white">
                {movesPlayed}
              </span>
            )}
          </button>
          <button
            onClick={handleCopy}
            title={copied ? "Copied" : "Copy FEN"}
            className={cn(
              "flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 transition-colors sm:min-h-8 sm:min-w-8 sm:px-2",
              copied
                ? "bg-(--markify-success-20) text-(--markify-success)"
                : "text-(--markify-muted-fg) hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg)",
            )}
            type="button"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="flex w-full flex-col">
          <div className="w-full min-w-0">
            {parsed.error ? (
              <p className="rounded-md border border-(--markify-destructive-30) bg-(--markify-destructive-10) p-3 text-center text-sm text-(--markify-destructive)">
                {parsed.error}
              </p>
            ) : (
              <Chessboard
                options={{
                  position: positionFen,
                  boardOrientation: orientation,
                  allowDragging: playable,
                  allowDrawingArrows: false,
                  showNotation,
                  squareStyles,
                  onPieceDrop,
                  onSquareClick: handleSquareClick,
                }}
              />
            )}
          </div>
          {!parsed.error && (
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-(--markify-muted-fg-70)">
              <span>
                {parsed.streaming ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-(--markify-border) border-t-(--markify-fg)" />
                    Streaming…
                  </span>
                ) : (
                  liveLabel
                )}
              </span>
              {playable && <span className="hidden sm:inline">Drag or click to move</span>}
            </div>
          )}
        </div>
      ) : (
        <pre className="m-0 overflow-x-auto p-3 font-mono text-xs leading-relaxed text-(--markify-fg-90) sm:p-4">
          <code>{fen}</code>
        </pre>
      )}
    </div>
  );
}

function parseFen(fen: string, isStreaming: boolean): { fen: string; label: string; error: string | null; streaming: boolean } {
  const trimmed = fen.trim();
  const g = new Chess();
  try {
    g.load(trimmed);
    const turn = g.turn() === "w" ? "White" : "Black";
    const label = g.isGameOver()
      ? (g.isCheckmate() ? `Checkmate: ${g.turn() === "w" ? "Black" : "White"} wins` : "Game over")
      : g.inCheck()
        ? `${turn} is in check`
        : `${turn} to move`;
    return { fen: g.fen(), label, error: null, streaming: false };
  } catch {
    if (isStreaming) {
      const partial = padPlacement(trimmed.split(/\s/, 1)[0] ?? "");
      try {
        const pg = new Chess();
        pg.load(`${partial} w - - 0 1`);
        return { fen: pg.fen(), label: "", error: null, streaming: true };
      } catch {
        return { fen: trimmed, label: "", error: null, streaming: true };
      }
    }
    return { fen: trimmed, label: "", error: "Invalid FEN", streaming: false };
  }
}

/* Pad a (possibly partial) FEN placement field so chess.js can load it. */
function padPlacement(placement: string): string {
  const files = "abcdefgh";
  const pos: Record<string, string> = {};
  let rank = 0;
  let file = 0;
  for (const ch of placement) {
    if (ch === "/") {
      rank++;
      file = 0;
      continue;
    }
    if (rank > 7) break;
    if (/[1-8]/.test(ch)) {
      file += parseInt(ch, 10);
      continue;
    }
    if (/[pnbrqkPNBRQK]/.test(ch)) {
      if (file < 8) pos[files[file] + (8 - rank)] = ch;
      file++;
      continue;
    }
    break;
  }
  const ranks: string[] = [];
  for (let r = 0; r < 8; r++) {
    let row = "";
    let empties = 0;
    for (let f = 0; f < 8; f++) {
      const sq = files[f] + (8 - r);
      const piece = pos[sq];
      if (piece) {
        if (empties) {
          row += empties;
          empties = 0;
        }
        row += piece;
      } else {
        empties++;
      }
    }
    if (empties) row += empties;
    ranks.push(row);
  }
  return ranks.join("/");
}

export const FenBoard = memo(FenBoardInner);
