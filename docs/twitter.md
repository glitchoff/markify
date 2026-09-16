# Tweet Embeds (Twitter / X)

Markify can turn tweet URLs into embedded, in-page tweets, no `widgets.js` boilerplate needed.

Embedding is **opt-in**. Enable it with the `twitterEnabled` prop:

```tsx
import { Markify } from "@glitchoff/markify";

<Markify twitterEnabled>{markdown}</Markify>
```

When disabled (the default), tweet URLs render exactly like any other link or image.

> [!NOTE]
> Only **Twitter/X** embeds, and only via **image syntax** (`![](...)`). Plain links always stay clickable links, and no other website is ever loaded or iframed.

---

## 1. Image Syntax Embed

Use image syntax with a tweet URL. It becomes an embedded tweet.

```markdown
![View on X](https://x.com/abhayglitch/status/2095773025799127367)
```

![View on X](https://x.com/abhayglitch/status/2095773025799127367)

---

## 2. Supported URL Forms

Both `x.com` and `twitter.com` are recognized (with or without `www.` or `m.`):

```markdown
https://x.com/abhayglitch/status/2095773025799127367
https://twitter.com/abhayglitch/status/2095773025799127367
https://www.x.com/abhayglitch/status/2095773025799127367
https://mobile.twitter.com/abhayglitch/status/2095773025799127367
```

Query parameters (e.g. `?ref_src=twsrc%5Etfw`) are stripped. Only the status id is kept.

---

## 3. Streaming & Loading Behavior

While content is streaming, embeds don't render on every token. Instead a lightweight **"View tweet on X"** link placeholder is shown; the tweet mounts only once the block is final.

Tweet HTML is fetched from Twitter's oEmbed endpoint and upgraded in place by `widgets.js` — the same mechanism as X's own share embeds. Responses are cached per status id per theme.

---

## 4. Dark Mode

The embed follows your app's theme automatically — no extra props. Markify watches the same signal your theme toggle uses (the `.dark` class on the document root, per [Theming](/docs/theming)), and requests the matching `theme=dark|light` embed from oEmbed.

---

## Privacy & Performance

* **Do-not-track**: iframes load with `dnt=true`, so Twitter's widget won't set tracking cookies.
* **Lazy loading**: iframes use `loading="lazy"` so embeds load only when near the viewport.
* **Responsive**: embeds fill the container width and scale with it.

---

## Custom Embed Rendering

Prefer your own embed, click-to-consent gate, or a different provider? Override the `twitter` renderer — this only affects tweet URLs, leaving regular images untouched:

```tsx
import { Markify, type Renderers } from "@glitchoff/markify";

const renderers: Renderers = {
  twitter: ({ src, id, isStreaming }) => (
    <MyTweetEmbed id={id} loading={isStreaming} />
  ),
};

<Markify twitterEnabled renderers={renderers}>{markdown}</Markify>
```

You can also override all images (Twitter included) at once via the `components`/`img` renderer.

`parseTweetId` is exported from the package so you can reuse the URL parsing logic:

```ts
import { parseTweetId } from "@glitchoff/markify";

const id = parseTweetId("https://x.com/abhayglitch/status/2095773025799127367");
// → "2095773025799127367"
```