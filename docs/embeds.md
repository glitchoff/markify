# Video Embeds (YouTube)

Markify can turn YouTube URLs into embedded, in-page video players — no iframe boilerplate needed.

Embedding is **opt-in**. Enable it with the `youtubeEnabled` prop:

```tsx
import { Markify } from "@glitchoff/markify";

<Markify youtubeEnabled>{markdown}</Markify>
```

When disabled (the default), YouTube URLs render exactly like any other link or image.

> [!NOTE]
> Only **YouTube** embeds, and only via **image syntax** (`![](...)`). Plain links always stay clickable links, and no other website is ever loaded or iframed.

---

## 1. Image Syntax Embed

Use image syntax with a YouTube URL. It becomes a player.

```markdown
![Watch the video](https://www.youtube.com/watch?v=M5PbLfVGOQs)
```

![Watch the video](https://www.youtube.com/watch?v=M5PbLfVGOQs)

---

## 2. Supported URL Forms

All of the following are recognized and normalized to a privacy-enhanced player:

```markdown
https://www.youtube.com/watch?v=M5PbLfVGOQs
https://youtu.be/M5PbLfVGOQs
https://www.youtube.com/shorts/M5PbLfVGOQs
https://www.youtube.com/embed/M5PbLfVGOQs
https://www.youtube.com/live/M5PbLfVGOQs
https://www.youtube-nocookie.com/embed/M5PbLfVGOQs
```

Playlists and unrelated query parameters are stripped. Only the video id is kept.

---

## 3. Starting At A Timestamp

Use `?t=1m30s` or `?start=90` to start playback at a specific time.

```markdown
[Intro](https://www.youtube.com/watch?v=M5PbLfVGOQs&t=30)
```

[Intro](https://www.youtube.com/watch?v=M5PbLfVGOQs&t=30)

---

## 4. Streaming Behavior

While content is streaming, embeds don't mount a player on every token. Instead a lightweight **"Watch on YouTube"** link placeholder is shown; the iframe mounts only once the block is final.

---

## Privacy & Performance

* **Privacy-enhanced** — players load from `youtube-nocookie.com`, not `youtube.com`.
* **Lazy loading** — iframes use `loading="lazy"` so players load only when near the viewport.
* **Responsive** — embeds fill the container at a 16:9 aspect ratio and scale with it.

---

## Custom Embed Rendering

Prefer your own player, thumbnail link, or click-to-consent gate? Override the renderers:

```tsx
const components = createMarkdownComponents({
  youtubeEnabled: true,
  img: ({ src, alt }) => <MyEmbed url={src} />,
});
```

`parseYouTubeId` is exported from the package so you can reuse the URL parsing logic:

```ts
import { parseYouTubeId } from "@glitchoff/markify";

const video = parseYouTubeId("https://youtu.be/M5PbLfVGOQs?t=30");
// → { id: "M5PbLfVGOQs", start: 30 }
```
