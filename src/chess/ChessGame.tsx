"use client";

import { useCallback, useEffect, useMemo, useState, memo } from "react";
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
};

function tryLoadPgn(pgn: string): Chess | null {
  try {
    const g = new Chess();
    g.loadPgn(pgn);
    return g;
  } catch {
    return null;
  }
}

function parsePgn(pgn: string, isStreaming: boolean): { plies: PlyInfo[]; headers: Record<string, string>; error: string | null; loading: boolean } {
  // While streaming, wait for the full game before rendering — incomplete
  // PGN is ambiguous and would flicker the board / status between tokens.
  if (isStreaming) return { plies: [], headers: {}, error: null, loading: true };

  const headers: Record<string, string> = {};
  const game = tryLoadPgn(pgn);
  let error: string | null = null;
  let plies: PlyInfo[] = [];

  if (game) {
    const walker = new Chess();
    for (const h of game.history({ verbose: true })) {
      const mv = walker.move(h.san);
      plies.push({ san: mv.san, from: mv.from, to: mv.to });
    }
  } else {
    error = "Invalid PGN";
  }

  const headerBlock = /^(?:\[[^\]]+\]\s*\r?\n)+/.exec(pgn.replace(/^\s+/, ""));
  if (headerBlock) {
    const tagRe = /\[(\w+)\s+"([^"]*)"\]/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(headerBlock[0]))) {
      headers[m[1]] = m[2];
    }
  }

  return { plies, headers, error, loading: false };
}

function fenAt(plies: PlyInfo[], upTo: number): string {
  const g = new Chess();
  for (let i = 0; i < upTo; i++) {
    const p = plies[i];
    try {
      g.move({ from: p.from, to: p.to, promotion: "q" });
    } catch {
      g.move(p.san);
    }
  }
  return g.fen();
}

function ChessGameInner({ pgn, className, showNotation = true, isStreaming = false }: ChessGameProps) {
  const { plies, headers, error, loading } = useMemo(() => parsePgn(pgn, isStreaming), [pgn, isStreaming]);

  const [currentPly, setCurrentPly] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [copied, setCopied] = useState(false);

  const total = plies.length;
  const lastPly = total > 0 ? plies[total - 1] : null;

  const currentFen = useMemo(() => {
    if (total === 0) return new Chess().fen();
    return fenAt(plies, currentPly);
  }, [plies, currentPly, total]);

  const { fen, sideToMove, inCheck, isOver, result } = useMemo(() => {
    const g = new Chess(currentFen);
    const over = g.isGameOver();
    let res = "";
    if (g.isCheckmate()) res = g.turn() === "w" ? "Black wins" : "White wins";
    else if (g.isStalemate()) res = "Stalemate";
    else if (g.isThreefoldRepetition()) res = "Draw (repetition)";
    else if (g.isInsufficientMaterial()) res = "Draw (insufficient material)";
    else if (g.isDraw()) res = "Draw";
    return {
      fen: g.fen(),
      sideToMove: g.turn(),
      inCheck: g.inCheck(),
      isOver: over,
      result: res,
    };
  }, [currentFen]);

  const lastMoveSquareStyles = useMemo(() => {
    if (!lastPly || currentPly === 0) return {};
    return {
      [lastPly.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      [lastPly.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    };
  }, [lastPly, currentPly]);

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

  return (
    <div className={cn("relative mb-(--markify-gap) overflow-hidden rounded-lg border border-border bg-card flex flex-col", className)}>
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
          <HeaderButton onClick={handleFlip} title="Flip board">
            <RotateCcw className="size-4" />
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

          <div className="flex flex-col gap-4 p-3 sm:flex-row sm:gap-5 sm:p-4">
            <div className="mx-auto w-full max-w-[420px] min-w-0 shrink-0">
              <Chessboard
                options={{
                  position: fen,
                  boardOrientation: orientation,
                  allowDragging: false,
                  allowDrawingArrows: true,
                  showNotation,
                  squareStyles: lastMoveSquareStyles,
                }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="max-h-[220px] flex-1 overflow-y-auto rounded-md border border-border p-2 [scrollbar-width:thin] sm:max-h-[260px]">
                {total === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No moves in this game.</p>
                ) : (
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5 text-sm">
                    {Array.from({ length: Math.ceil(total / 2) }).map((_, i) => {
                      const white = plies[i * 2];
                      const black = plies[i * 2 + 1];
                      return (
                        <div key={i} className="contents">
                          <span className="select-none py-0.5 pr-1 text-right font-mono text-xs text-muted-foreground">
                            {i + 1}.
                          </span>
                          <MoveButton active={currentPly === i * 2 + 1} onClick={() => goTo(i * 2 + 1)}>
                            {white?.san ?? ""}
                          </MoveButton>
                          {black ? (
                            <MoveButton active={currentPly === i * 2 + 2} onClick={() => goTo(i * 2 + 2)}>
                              {black.san}
                            </MoveButton>
                          ) : (
                            <span />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-1.5">
                <NavButton onClick={goFirst} disabled={currentPly === 0} title="First move">
                  <ChevronFirst className="size-4" />
                </NavButton>
                <NavButton onClick={goPrev} disabled={currentPly === 0} title="Previous move">
                  <ChevronLeft className="size-4" />
                </NavButton>
                <NavButton onClick={goNext} disabled={currentPly >= total} title="Next move">
                  <ChevronRight className="size-4" />
                </NavButton>
                <NavButton onClick={goLast} disabled={currentPly >= total} title="Last move">
                  <ChevronLast className="size-4" />
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
          </div>
        </>
      )}
    </div>
  );
}

function MoveButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded px-1.5 py-0.5 text-left transition-colors",
        active ? "bg-primary/15 font-medium text-primary" : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
      type="button"
    >
      {children}
    </button>
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
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-10 sm:w-10",
        "hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export const ChessGame = memo(ChessGameInner);