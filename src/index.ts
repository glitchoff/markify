export { Markify } from "./Markify";
export type { MarkifyProps, MarkifySpacing } from "./Markify";

// Re-export react-markdown types for custom components
export type { Components } from "react-markdown";

export { useStreamingReveal } from "./streaming";
export { remarkFixKaTeXUnicode } from "./fix-katex-unicode";
export { parseCallout, getText, stripCalloutMarker } from "./callout";
export { cn, injectHljsTheme } from "./utils";

export { TableOptionsContext, useTableOptions } from "./markdown-components";
export type { TableOptions, Renderers, BlockRendererArgs, CodeRendererProps, YouTubeVideo } from "./markdown-components";
export { parseYouTubeId } from "./markdown-components";

// Mermaid types
export type { MarkifyMermaidConfig, MermaidBlockProps } from "./MermaidBlock";

// Theme
export type { HljsTheme } from "./themes";
export { ATOM_DARK_CSS, ATOM_LIGHT_CSS, getThemeCss } from "./themes";