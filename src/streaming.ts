import { useRef, useEffect, useState, useCallback } from "react";

interface StreamConfig {
  baseCharsPerFrame: number;
  maxCatchupMultiplier: number;
  catchupThreshold: number;
  minFrameMs: number;
  wordSnapLookahead: number;
}

const STREAM_CONFIG: StreamConfig = {
  baseCharsPerFrame: 12,
  maxCatchupMultiplier: 8,
  catchupThreshold: 60,
  minFrameMs: 16,
  wordSnapLookahead: 12,
};

export function useStreamingReveal(
  content: string,
  isStreaming: boolean,
): string {
  const [displayed, setDisplayed] = useState("");
  const targetRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const displayedLenRef = useRef(0);

  const reveal = useCallback((timestamp: number) => {
    if (timestamp - lastUpdateRef.current < STREAM_CONFIG.minFrameMs) {
      rafRef.current = requestAnimationFrame(reveal);
      return;
    }
    lastUpdateRef.current = timestamp;

    const target = targetRef.current;
    const currentLen = displayedLenRef.current;
    const lag = target.length - currentLen;

    if (lag <= 0) {
      rafRef.current = null;
      return;
    }

    const multiplier =
      lag > STREAM_CONFIG.catchupThreshold
        ? Math.min(
            STREAM_CONFIG.maxCatchupMultiplier,
            1 + lag / STREAM_CONFIG.catchupThreshold,
          )
        : 1;

    const charsToAdd = Math.ceil(STREAM_CONFIG.baseCharsPerFrame * multiplier);
    let nextLen = Math.min(currentLen + charsToAdd, target.length);

    if (nextLen < target.length) {
      const spaceIdx = target.indexOf(" ", nextLen);
      const newlineIdx = target.indexOf("\n", nextLen);
      const boundary = Math.min(
        spaceIdx === -1 ? Infinity : spaceIdx + 1,
        newlineIdx === -1 ? Infinity : newlineIdx + 1,
      );
      if (
        boundary !== Infinity &&
        boundary <= nextLen + STREAM_CONFIG.wordSnapLookahead
      ) {
        nextLen = boundary;
      }
    }

    displayedLenRef.current = nextLen;
    setDisplayed(target.slice(0, nextLen));
    rafRef.current = requestAnimationFrame(reveal);
  }, []);

  useEffect(() => {
    targetRef.current = typeof content === "string" ? content : String(content || "");

    if (!isStreaming) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      displayedLenRef.current = targetRef.current.length;
      setDisplayed(targetRef.current);
      return;
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(reveal);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [content, isStreaming, reveal]);

  return displayed;
}
