# Tweet Embeds (Twitter/X)

Image syntax with a `twitter:` **prefix in the URL position** becomes an embedded tweet.

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

## Behavior

- Fetched via the **oEmbed API** (`publish.twitter.com`), rendered with the official widgets script
- **Light/dark follow**: the widget theme tracks the app's `.dark` class (a MutationObserver watches for changes)
- **Cached** per tweet + theme in memory
- Replies are hidden; the tweet centers inside the content width
- **Streaming**: renders as a "View tweet on X" link until content completes
- **Toggle**: `markifyConfig.embeds.twitter = false` renders these as normal images
