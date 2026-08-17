"use client";

import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Copy, Check, Eye, Code2, RotateCcw } from "lucide-react";
import { cn } from "../utils";

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

  // Live, playable game state — initialized from the parsed FEN, updated as
  // the user drags pieces. Reset restores the original position.
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

  // Click-to-move: select a piece, then click a destination.
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
      // Illegal — if clicking another own piece, reselect; else deselect.
      if (piece) setSelected(square);
      else setSelected(null);
      return;
    }
    setGame(ng);
    setSelected(null);
    setMovesPlayed((n) => n + 1);
  }, [game, selected]);

  // Highlight selected square + legal target squares.
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
    if (game.isCheckmate()) return `Checkmate — ${game.turn() === "w" ? "Black" : "White"} wins`;
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
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fen;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fen]);

  return (
    <div className={cn("relative mb-(--markify-gap) overflow-hidden rounded-lg border border-border bg-card flex flex-col w-full min-w-0", className)} style={{ maxWidth }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-border bg-muted px-2.5 py-1.5 sm:px-3">
        <span className="font-mono text-xs font-medium text-muted-foreground">fen</span>
        <div className="flex gap-0.5 sm:gap-1">
          <button
            onClick={() => setPreview((p) => !p)}
            title={preview ? "Show code" : "Show board"}
            className="flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground sm:min-h-8 sm:min-w-8 sm:px-2"
            type="button"
          >
            {preview ? <Code2 className="size-4" /> : <Eye className="size-4" />}
          </button>
          <button
            onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
            title="Flip board"
            className="flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground sm:min-h-8 sm:min-w-8 sm:px-2"
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
                ? "text-red-500 hover:bg-red-500/10"
                : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground",
            )}
            type="button"
          >
            <RotateCcw className="size-4" />
            {movesPlayed > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
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
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground",
            )}
            type="button"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="w-full min-w-0">
            {parsed.error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
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
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground/70">
              <span>
                {parsed.streaming ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-border border-t-foreground" />
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
        <pre className="m-0 overflow-x-auto p-3 font-mono text-xs leading-relaxed text-foreground/90 sm:p-4">
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
      ? (g.isCheckmate() ? `Checkmate — ${g.turn() === "w" ? "Black" : "White"} wins` : "Game over")
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

// Pad a (possibly partial) FEN placement field into a full 8-rank / 8-file
// placement so chess.js can load it: incomplete ranks are filled with empty
// squares and missing ranks are added as empty rows.
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
        if (empties) { row += empties; empties = 0; }
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