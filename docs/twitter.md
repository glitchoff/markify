# Tweet Embeds (Twitter/X)

Image syntax with a `twitter:` **prefix in the URL position** becomes X's **official embed** — the same blockquote + `widgets.js` flow X's publish page gives you, handled for you:

- **Light/dark follow** your app theme automatically (the blockquote gets `data-theme="dark|light"` before upgrade, and re-renders when you toggle)
- **Conversations hidden** (`data-conversation="none"`) — just the tweet, no parent thread
- **No boilerplate**: no manual `<script>` tags, `widgets.js` is injected once and the blockquote is upgraded in place
- **Do-not-track**: fetched with `dnt=true`

```markdown
![](twitter:https://x.com/abhayglitch/status/2095773025799127367)
```

![](twitter:https://x.com/abhayglitch/status/2095773025799127367)

## Accepted forms

```markdown
![](twitter:https://x.com/username/status/2095773025799127367)
![](twitter:https://twitter.com/username/status/2095773025799127367)
![](twitter:2095773025799127367)     bare status id
```

Query parameters are stripped; only the status id is kept.

## Language

Set the widget UI language globally:

```ts
markifyConfig.embeds = {
  youtube: true,
  twitter: true,
  tweetOptions: { lang: "en" },
};
```

## Behavior

- The blockquote HTML is fetched from **`publish.twitter.com/oembed`** (the only X endpoint with an open CORS policy) and cached per tweet in memory
- **Streaming**: renders as a "View tweet on X" link until content completes
- **Offline/failed fetch**: falls back to the same link
- **Toggle**: `markifyConfig.embeds.twitter = false` renders these as normal images
