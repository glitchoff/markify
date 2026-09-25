# Using Markify in Other Renderers

Markify ships `<Markify>` as the main entry, but everything it renders lives in your repo as standalone, self-contained components. Any renderer that accepts a react-markdown-style `components` map — Next.js MDX, Fumadocs, react-markdown itself — can render **your** Markify components instead of its own defaults. Same look everywhere: docs site, chat UI, marketing pages.

## What's exported

Every component is exported from its own file in `components/markify/comps/`:

| File | Exports |
|---|---|
| `typography.tsx` | `H1` `H2` `H3` `H4` `H5` `H6`, `Paragraph`, `Link`, `InlineCode`, `UnorderedList`, `OrderedList`, `ListItem`, `Hr` |
| `table.tsx` | `Table`, `THead`, `TBody`, `TR`, `TH`, `TD` (+ `TableOptionsContext`) |
| `blockquote.tsx` | `Blockquote` — auto-renders a `Callout` when the `> [!NOTE]`-style marker is present |
| `callout.tsx` | `Callout` + `parseCallout`, `stripCalloutMarker` |
| `code-block.tsx` | `CodeBlock` (+ `extractLanguage`, `getCodeText`, `preloadLanguages`, `DEFAULT_LANGUAGES` / `ALL_LANGUAGES`, `injectHljsTheme`) |
| `embeds.tsx` | `Image` — the YouTube/Twitter embed router (+ `parseYouTubeId`, `parseTweetId`) |
| `chess.tsx` | `ChessGame`, `FenBoard` |
| `mermaid.tsx` | `MermaidBlock` |
| `fallbacks.tsx` | `Spinner`, `ChessFallback`, `MermaidFallback` |
| `_lib.ts` | `cn`, `hash`, `copyToClipboard`, `downloadText` and other tiny helpers |

```tsx
import { H1, Paragraph, CodeBlock } from "@/components/markify/comps/typography";
import { CodeBlock } from "@/components/markify/comps/code-block";
```

All of them are plain React + Tailwind with no context requirements — except `Table`, which reads `TableOptionsContext` for the copy/download buttons (see below).

## Mapping to a `components` map

Renderers built on react-markdown (Next.js MDX, Fumadocs, react-markdown) pass each markdown element's props to a keyed component. Markify's typography and table components accept exactly those props (`children`, `className`, plus standard HTML attributes), so the wiring is one-to-one:

```tsx
// next.config / MDX provider or Fumadocs page
import { H1, H2, H3, H4, H5, H6, Paragraph, Link, InlineCode, UnorderedList, OrderedList, ListItem, Hr } from "@/components/markify/comps/typography";
import { Table, THead, TBody, TR, TH, TD } from "@/components/markify/comps/table";
import { Blockquote } from "@/components/markify/comps/blockquote";
import { Image } from "@/components/markify/comps/embeds";
import { CodeBlock, extractLanguage, getCodeText } from "@/components/markify/comps/code-block";

export const markifyMap = {
  h1: (props) => <H1 {...props} />,
  h2: (props) => <H2 {...props} />,
  h3: (props) => <H3 {...props} />,
  h4: (props) => <H4 {...props} />,
  h5: (props) => <H5 {...props} />,
  h6: (props) => <H6 {...props} />,
  p: (props) => <Paragraph {...props} />,
  a: (props) => <Link {...props} />,
  code: (props) => <InlineCode {...props} />,   // inline code
  ul: (props) => <UnorderedList {...props} />,
  ol: (props) => <OrderedList {...props} />,
  li: (props) => <ListItem {...props} />,
  hr: () => <Hr />,
  blockquote: (props) => <Blockquote {...props} />,   // GitHub callouts work too
  img: (props) => <Image {...props} />,               // plain images — no embed flags
  table: (props) => <Table {...props} />,
  thead: (props) => <THead {...props} />,
  tbody: (props) => <TBody {...props} />,
  tr: (props) => <TR {...props} />,
  th: (props) => <TH {...props} />,
  td: (props) => <TD {...props} />,
};
```

### Code blocks (`pre`)

`CodeBlock` needs the fence's language and the raw code text. Renderers hand those to you on `pre`'s `code` child — the same way Markify's own `pre` router does inside `config.tsx`:

```tsx
import { CodeBlock, extractLanguage, getCodeText } from "@/components/markify/comps/code-block";

const pre = (props) => {
  const lang = extractLanguage(props.children, props.className);
  return (
    <CodeBlock className={props.className} language={lang}>
      {props.children}
    </CodeBlock>
  );
};

// add to the map:
pre,
```

Optional props on `CodeBlock` (`worker`, `hljsTheme`, `codeFontFamily`, …) let you match whatever `codeBlock` settings you chose in `config.tsx`. If you want Mermaid or chess fences too, route on the language like `buildComponents` does — those components are exported as well (`MermaidBlock`, `ChessGame`, `FenBoard`, plus `MermaidFallback` / `ChessFallback` for the lazy-loading states).

## Tables need `TableOptionsContext`

`Table` renders copy-as-Markdown / export buttons and reads its options from context. In a foreign renderer nothing provides that context — wrap your doc page once:

```tsx
import { TableOptionsContext } from "@/components/markify/comps/table";

<TableOptionsContext.Provider value={{ showCopyButton: true, downloadFormats: ["csv"], scrollable: true }}>
  <MDXContent components={markifyMap} />
</TableOptionsContext.Provider>
```

Without a provider it falls back to `defaultTableOptions` (copy button on, no export formats), which is a perfectly fine default.

## Fumadocs

Fumadocs' `<DocsPage>` renderer takes a `components` prop with the same contract — pass the map above and Fumadocs' defaults (its own code blocks, typography) are replaced by Markify's:

```tsx
import { DocsPage } from "fumadocs-ui/page";
import { markifyMap, pre } from "./markify-map";

export default function Page({ ast }) {
  return (
    <DocsPage>
      <MDXContent
        components={{ ...markifyMap, pre }}
      />
    </DocsPage>
  );
}
```

Notes:

- Keep Fumadocs' heading anchors: Fumadocs generates heading IDs for its TOC. If your headings lose anchors, spread them through: `h2: (props) => <H2 {...props} />` preserves `id` automatically since `H2` passes extra props to the underlying element.
- Fumadocs' code-block enhancements (`title=`, metadata) won't show — `CodeBlock` is the renderer now, per your `codeBlock` config.

## Next.js MDX

In `next.config.mjs` MDX pages use whatever `components` you hand to `MDXContent`, or via a provider in `_app`/layout:

```tsx
import { MDXProvider } from "@mdx-js/react";
import { markifyMap } from "./markify-map";

export default function Layout({ children }) {
  return <MDXProvider components={markifyMap}>{children}</MDXProvider>;
}
```

Every `.mdx` page in that tree now renders Markify's typography, tables, callouts, and code blocks — while `<Markify>` keeps handling your streaming chat content with the same components underneath.

## What you give up (and how to get it back)

`<Markify>` adds four things on top of the component map, and none of them apply to a foreign renderer automatically:

1. **Streaming repair + block splitting** — irrelevant for docs (content is complete).
2. **Spacing, theme, `cssVars`, `fontFamily`** — the `<Markify>` wrapper injects `--markify-*` variables and sets `font-family`. In a foreign renderer your shadcn tokens still style everything (components use standard shadcn tokens like `--background`, `--muted`, `--border`), but `--markify-*` spacing/radius aliases come from `tokens.css` — make sure it's imported once (it already is, via `config.tsx`).
3. **Embed flags** — `img: Image` alone renders plain images; YouTube/Twitter embeds need `youtubeEnabled` / `twitterEnabled` props. Pass them or leave embeds to `<Markify>` only.
4. **Mermaid/chess lazy-loading** — wire them into your `pre` router with `React.lazy` + the fallbacks if you want them outside `<Markify>`.

## When to use which

| Situation | Use |
|---|---|
| Streaming AI/chat content | `<Markify>` |
| Docs pages (Fumadocs, Next MDX) where you want Markify's look | component map on the foreign renderer |
| Anything else in your app rendering static markdown | `<Markify>` with `isStreaming` off — simplest option |

Rendering static content? Just use `<Markify>` itself — you only need the component map when a host framework forces you through its own renderer (MDX compilation, Fumadocs routes).
