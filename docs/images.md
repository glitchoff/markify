# Images

Markify renders standard Markdown images (`![alt](url)`) as responsive, lazy-loaded `<img>` elements.

Images are centered, rounded, constrained to the available width, and work naturally with animated media, links, lists, and callouts.

---

## 1. Basic Image

Use standard Markdown image syntax with descriptive alt text.

```markdown
![Cat typing furiously at 3 AM](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)
```

![Cat typing furiously at 3 AM](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

Alt text is preserved for accessibility and used when the image cannot be displayed.

---

## 2. Images With Titles

Add a title after the image URL to provide additional context.

```markdown
![This is the markdown library I want](https://media.giphy.com/media/L3ERvA6jWCd0qO4NdX/giphy.gif "This is the markdown library I want — it GIF points at you")
```

![This is the markdown library I want](https://media.giphy.com/media/L3ERvA6jWCd0qO4NdX/giphy.gif "This is the markdown library I want — it GIF points at you")

The title is passed to the underlying `<img>` element and appears as a native browser tooltip when hovering over the image.

Titles are useful for captions, credits, additional context, or small Easter eggs.

---

## 3. Animated Images

GIFs work through exactly the same Markdown syntax as static images.

```markdown
![Kaguya](https://media1.tenor.com/m/jbj0wZlaPyMAAAAC/kaguya-shinomiya-kaguya-sama.gif)
```

![Kaguya](https://media1.tenor.com/m/jbj0wZlaPyMAAAAC/kaguya-shinomiya-kaguya-sama.gif)

No special syntax is needed. If the source is animated, Markify renders it as animated media.

---

## 4. Inline Images

Images can appear directly inside running text.

```markdown
The build passed ![build passing](https://img.shields.io/badge/build-passing-2ea44f?style=flat-square), so we're shipping it.
```

The build passed ![build passing](https://img.shields.io/badge/build-passing-2ea44f?style=flat-square), so we're shipping it.

Inline images are useful for badges, icons, status indicators, and other compact visuals that belong inside a sentence.

---

## 5. Images in Lists

Images work naturally inside Markdown lists.

```markdown
- **Git blame points straight at you** ![Homer disappearing](https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif)
- **CI/CD pipeline unexpectedly passes on push #1** ![Stay calm it is happening](https://media.giphy.com/media/huJmPXfeir5JlpPAx0/giphy.gif)
- **Not sure if bug or undocumented feature** ![Fry squinting](https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif)
```

- **Git blame points straight at you** ![Homer disappearing](https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif)
- **CI/CD pipeline unexpectedly passes on push #1** ![Stay calm it is happening](https://media.giphy.com/media/huJmPXfeir5JlpPAx0/giphy.gif)
- **Not sure if bug or undocumented feature** ![Fry squinting](https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif)

Images remain regular Markdown nodes, so they compose naturally with lists and other content.

---

## 6. Images Inside Callouts

Images can be nested inside Markify callouts alongside other Markdown content.

```markdown
> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other supported Markdown content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)
```

> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other supported Markdown content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)

Callouts support the same nested Markdown content available elsewhere in Markify.

---

## 7. Clickable Images

Wrap an image in Markdown link syntax to make the image itself clickable.

```markdown
[![Open the Markify repository](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif "Open on GitHub")](https://github.com/glitchoff/markify)
```

[![Open the Markify repository](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif "Open on GitHub")](https://github.com/glitchoff/markify)

Clickable images are useful for thumbnails, previews, banners, screenshots, and external resources.

---

## Loading & Performance

Markify uses browser-native features to keep image rendering lightweight.

* **Lazy loading** — images use `loading="lazy"`.
* **Async decoding** — images use `decoding="async"`.
* **Responsive sizing** — images stay within their container.
* **Animated media** — GIFs work through the same Markdown image syntax.
* **Nested rendering** — images work inside lists, callouts, and links.

---

## Custom Image Rendering

Need a lightbox, custom wrapper, image optimization, or framework-specific image component?

Override the default image renderer with `createMarkdownComponents`:

```tsx
import { createMarkdownComponents } from 'markify';

export const components = createMarkdownComponents({
  img: ({ src, alt, title }) => (
    <figure className="my-6 flex flex-col items-center">
      <img
        src={src}
        alt={alt || 'Markify image'}
        title={title}
        loading="lazy"
        decoding="async"
        className="max-w-full rounded-2xl border border-neutral-800/20 shadow-lg transition-transform duration-200 hover:scale-[1.02]"
      />

      {title && (
        <figcaption className="mt-2.5 text-xs font-mono text-neutral-500">
          {title}
        </figcaption>
      )}
    </figure>
  ),
});
```

The renderer receives the standard Markdown image properties — `src`, `alt`, and `title` — so you can completely control how images are rendered in your application.
