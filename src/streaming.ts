import remend from "remend";

export function useStreamingReveal(
  content: string,
  isStreaming: boolean,
): string {
  if (!content) return "";
  return isStreaming ? remend(content) : content;
}