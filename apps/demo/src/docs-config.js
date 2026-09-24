// Shared docs registry for the demo site.
import {
  Compass,
  Palette,
  Ruler,
  Type,
  Sigma,
  Workflow,
  ChessKnight,
  Table,
  MessageSquareQuote,
  Image,
  Video,
  Bird,
  Activity,
  Settings2,
  Code2,
} from "lucide-react";

export const DOC_GROUPS = [
  {
    label: "Getting Started",
    items: [{ id: "getting-started", title: "Getting Started", file: "getting-started.md", icon: Compass }],
  },
  {
    label: "Styling",
    items: [
      { id: "theming", title: "Theming & Dark Mode", file: "theming.md", icon: Palette },
      { id: "layout-and-sizing", title: "Layout & Sizing", file: "layout-and-sizing.md", icon: Ruler },
      { id: "styling", title: "Styling & Spacing", file: "styling.md", icon: Type },
    ],
  },
  {
    label: "Features",
    items: [
      { id: "diagrams-and-math", title: "Math (KaTeX)", file: "diagrams-and-math.md", icon: Sigma },
      { id: "mermaid", title: "Mermaid Diagrams", file: "mermaid.md", icon: Workflow },
      { id: "chess", title: "Chess (PGN/FEN)", file: "chess.md", icon: ChessKnight },
      { id: "tables-and-callouts", title: "Tables", file: "tables-and-callouts.md", icon: Table },
      { id: "callouts-and-blockquotes", title: "Callouts & Blockquotes", file: "callouts-and-blockquotes.md", icon: MessageSquareQuote },
      { id: "images", title: "Images", file: "images.md", icon: Image },
      { id: "embeds", title: "Video Embeds", file: "embeds.md", icon: Video },
      { id: "twitter", title: "Tweet Embeds", file: "twitter.md", icon: Bird },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "streaming", title: "Streaming Guide", file: "streaming.md", icon: Activity },
      { id: "customization", title: "Customization", file: "customization.md", icon: Settings2 },
      { id: "api-reference", title: "API Reference", file: "api-reference.md", icon: Code2 },
    ],
  },
];

export const FLAT_DOCS = DOC_GROUPS.flatMap((g) => g.items);

export function docIndex(id) {
  return FLAT_DOCS.findIndex((d) => d.id === id);
}

export function docFile(id) {
  return FLAT_DOCS[docIndex(id)]?.file;
}
