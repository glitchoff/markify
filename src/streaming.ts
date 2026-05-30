import { useDeferredValue } from "react";

export function useStreamingReveal(
  content: string,
  isStreaming: boolean,
): string {
  const deferred = useDeferredValue(content);
  return isStreaming ? deferred : content;
}
