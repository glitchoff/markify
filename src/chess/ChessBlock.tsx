"use client";

import { memo } from "react";
import { ChessGame } from "./ChessGame";
import type { ChessGameProps } from "./ChessGame";

export interface ChessBlockProps {
  code: string;
  className?: string;
  showNotation?: boolean;
  isStreaming?: boolean;
}

function ChessBlockInner({ code, className, showNotation, isStreaming }: ChessBlockProps) {
  return <ChessGame pgn={code} className={className} showNotation={showNotation} isStreaming={isStreaming} />;
}

export const ChessBlock = memo(ChessBlockInner);

export { ChessGame };
export type { ChessGameProps } from "./ChessGame";