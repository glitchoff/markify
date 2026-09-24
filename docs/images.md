# Images

`![alt](url)` renders a normal image — lazy-loaded, centered when it's the only content in a paragraph, capped at container width.

```markdown
![A cute cat](https://placekitten.com/600/400)
```

![A cute cat](https://placekitten.com/600/400)

## Behavior

| Aspect | Behavior |
|---|---|
| Loading | `loading="lazy"` |
| Sizing | `max-width: 100%`, auto height (base layer) |
| Styling | rounded corners, shadow, middle-aligned |
| Solo images | centered (paragraph containing only an image gets `text-center`) |
| Alt/title | forwarded to the `<img>` element |

## Streaming

During streaming, images render as soon as their markdown completes — no special handling needed.

## Custom rendering

Override the `img` mapping in `buildComponents` (config.tsx) or pass `components={{ img: MyImage }}` to `<Markify>` to take over image rendering entirely — e.g. for next/image optimization.

Embed prefixes (`youtube:`, `twitter:`) in the URL divert to media embeds instead — see [embeds](/docs/embeds).
