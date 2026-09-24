# Images

`![alt](url)` renders a standard Markdown image — lazy-loaded, rounded, capped at container width, and centered when it's the only content in a paragraph.

## Basic image

```markdown
![Cat typing furiously at 3 AM](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)
```

![Cat typing furiously at 3 AM](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

Alt text is preserved for accessibility and used when the image cannot be displayed.

## Images with titles

Add a title after the URL — it shows as a native browser tooltip on hover.

```markdown
![This is the markdown library I want](https://media.giphy.com/media/L3ERvA6jWCd0qO4NdX/giphy.gif "This is the markdown library I want: the GIF points at you")
```

![This is the markdown library I want](https://media.giphy.com/media/L3ERvA6jWCd0qO4NdX/giphy.gif "This is the markdown library I want: the GIF points at you")

Titles are useful for captions, credits, or small Easter eggs.

## Animated images

GIFs work through exactly the same syntax — no special handling needed:

```markdown
![Kaguya](https://media1.tenor.com/m/jbj0wZlaPyMAAAAC/kaguya-shinomiya-kaguya-sama.gif)
```

![Kaguya](https://media1.tenor.com/m/jbj0wZlaPyMAAAAC/kaguya-shinomiya-kaguya-sama.gif)

## Inline images

Images can appear inside running text — perfect for badges and status indicators:

```markdown
The build passed ![build passing](https://img.shields.io/badge/build-passing-2ea44f?style=flat-square), so we're shipping it.
```

The build passed ![build passing](https://img.shields.io/badge/build-passing-2ea44f?style=flat-square), so we're shipping it.

## Images in lists

Images are regular Markdown nodes, so they compose naturally with lists:

```markdown
- **Git blame points straight at you** ![Homer disappearing](https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif)
- **CI/CD pipeline unexpectedly passes on push #1** ![Stay calm it is happening](https://media.giphy.com/media/huJmPXfeir5JlpPAx0/giphy.gif)
- **Not sure if bug or undocumented feature** ![Fry squinting](https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif)
```

- **Git blame points straight at you** ![Homer disappearing](https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif)
- **CI/CD pipeline unexpectedly passes on push #1** ![Stay calm it is happening](https://media.giphy.com/media/huJmPXfeir5JlpPAx0/giphy.gif)
- **Not sure if bug or undocumented feature** ![Fry squinting](https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif)

## Images inside callouts

Images can be nested inside callouts alongside any other Markdown content:

```markdown
> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)
```

> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)

## Clickable images

Wrap an image in link syntax to make it clickable:

```markdown
[![Open the Markify repository](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif "Open on GitHub")](https://github.com/glitchoff/markify)
```

[![Open the Markify repository](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif "Open on GitHub")](https://github.com/glitchoff/markify)

## Behavior reference

| Aspect | Behavior |
|---|---|
| Loading | `loading="lazy"` |
| Sizing | `max-width: 100%`, auto height (base layer) |
| Styling | rounded corners, shadow, middle-aligned |
| Solo images | centered (paragraph containing only an image gets `text-center`) |
| Alt/title | forwarded to the `<img>` element |
| Animated media | GIFs work through the same syntax |
| Nested rendering | works inside lists, callouts, and links |

## Custom rendering

Override the `img` mapping in `buildComponents` (config.tsx) or pass `components={{ img: MyImage }}` to `<Markify>` to take over image rendering entirely — e.g. for `next/image` optimization or a lightbox:

```tsx
img: ({ src, alt, title }) => (
  <figure className="my-6 flex flex-col items-center">
    <img src={src} alt={alt ?? ""} title={title} loading="lazy" className="max-w-full rounded-2xl shadow-lg" />
    {title && <figcaption className="mt-2.5 text-xs font-mono text-neutral-500">{title}</figcaption>}
  </figure>
),
```

Embed prefixes (`youtube:`, `twitter:`) in the URL divert to media embeds instead — see [embeds](/docs/embeds) and [tweets](/docs/twitter).
