# Mermaid Diagrams

```` ```mermaid ```` blocks render interactive diagrams with zoom, pan, fullscreen, and export built in.

## Syntax

Wrap any [Mermaid diagram](https://mermaid.js.org/) in a fenced code block tagged `mermaid`:

````markdown
```mermaid
graph TD
    A[User] -->|Input| B[Process]
    B -->|Valid| C[Markify]
    C -->|Render| D[Output]
```
````

### Live example

```mermaid
graph LR
    A[Markdown] --> B[remark-gfm]
    B --> C[remark-math]
    C --> D[rehype-katex]
    D --> E[Mermaid]
```

Mermaid isn't just for flowcharts. Here are a few diagram types you can drop straight into everyday notes.

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

## Interactions

- **Pan** — drag the diagram (mouse or touch)
- **Zoom** — buttons bottom-left, Ctrl/Cmd + wheel zooms toward the cursor, pinch on touch
- **Reset** — double-click anywhere, or the reset button
- **Fullscreen** — the toolbar's expand button
- **Export** — SVG, PNG (2× rasterized), or the raw `.mmd` source
- **Copy** — diagram source to clipboard

## Lazy rendering

Diagrams render only when scrolled into view (IntersectionObserver). On render errors, the last valid SVG is kept and an error card offers a retry with the source shown.

## Configuration

```ts
markifyConfig.mermaid = {
  showHeader: true,       // toolbar with copy/download/fullscreen
  showBackground: true,   // card border and background
  fit: false,             // auto-fit diagram to container width
  theme: "dark",          // any mermaid MermaidConfig option passes through
  securityLevel: "loose",
};
```

When `mermaid.theme` isn't set explicitly, it follows the code block theme (`dark` → mermaid `dark`, light → `default`).
