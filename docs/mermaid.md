# Mermaid Diagrams

Markify renders interactive [Mermaid](https://mermaid.js.org/) diagrams: flowcharts, sequence diagrams, class diagrams, gantt, state, and more, straight from fenced ` ```mermaid ` blocks.

## 1. Usage

Write a Mermaid diagram inside a ` ```mermaid ` fence:

```markdown
```mermaid
graph TD
    A[User] -->|Input| B[Process]
    B -->|Valid| C[Markify]
    C -->|Render| D[Output]
```
```

### Live example

```mermaid
graph LR
    A[Markdown] --> B[remark-gfm]
    B --> C[remark-math]
    C --> D[rehype-katex]
    D --> E[Mermaid]
```

## 2. Toolbar Controls

Every diagram renders inside a card with a toolbar that provides:

| Control | Action |
|---------|--------|
| **Copy** | Copy the Mermaid source (MMD) to the clipboard. |
| **Download** | Export as SVG, PNG, or MMD. |
| **Fullscreen** | Expand the diagram to fill the screen. |
| **Zoom / Pan** | Zoom in/out and pan around the rendered diagram. |

## 3. Configuration (`mermaidConfig`)

Pass custom settings via the `mermaidConfig` prop. It accepts the full [Mermaid configuration](https://mermaid.js.org/config/) plus Markify-specific UI options:

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | `string` | Synced with `hljsTheme` | Mermaid theme (`"dark"`, `"default"`, `"forest"`, etc). |
| `showHeader` | `boolean` | `true` | Show the toolbar with copy/download/fullscreen buttons. |
| `showBackground` | `boolean` | `true` | Show the card border and background around diagrams. |
| `fit` | `boolean` | `false` | Auto-fit the diagram to the container width. |

Plus any standard Mermaid option (`fontFamily`, `flowchart`, `sequence`, `themeVariables`, …).

```tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis", nodeSpacing: 50, rankSpacing: 50 },
    themeVariables: { primaryColor: "#334155" },
    fit: true,
  }}
>
  {markdown}
</Markify>
```

### Minimal / inline look

Set `showHeader` and `showBackground` to `false` for a minimal inline diagram:

```tsx
<Markify
  mermaidConfig={{
    showHeader: false,
    showBackground: false,
  }}
>
  {markdown}
</Markify>
```

### Auto-fit

When `fit` is enabled, diagrams are scaled to fit their container. Users can still zoom and pan; the fit button in the header re-centers:

```tsx
<Markify mermaidConfig={{ fit: true }}>
  {markdown}
</Markify>
```

> [!NOTE]
> The `theme` default syncs with the `hljsTheme` prop, so dark-mode code blocks and diagrams stay consistent. Override it explicitly to decouple the two.

## 4. Examples

Mermaid isn't just for flowcharts. Here are a few diagrams you can drop straight into everyday notes.

### Gantt: planning a trip

```mermaid
gantt
    title Vacation Countdown
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Research
    Pick a destination         :r1, 2026-08-01, 5d
    Book flights               :r2, after r1, 3d

    section Booking
    Reserve the hotel          :b1, after r2, 4d
    Plan the itinerary         :b2, after b1, 6d

    section Prep
    Pack bags                  :p1, 2026-08-20, 2d
    Head to the airport        :milestone, p2, 2026-08-22, 0d
```

### Pie: where the weekend went

```mermaid
pie title Where the Weekend Went
    "Sleeping" : 34
    "Outdoor time" : 22
    "Cooking & eating" : 16
    "Streaming" : 14
    "Errands" : 10
    "Scrolling" : 4
```

### Timeline: a three-day road trip

```mermaid
timeline
    title Road Trip: 3 Days, 2 Cities
    Day 1 : Drive to the coast : Sunset at the pier
    Day 2 : Hike the cliffs : Picnic lunch : Beach bonfire
    Day 3 : Brunch in town : Drive home
```