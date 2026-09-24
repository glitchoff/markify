# Video Embeds (YouTube)

Image syntax with a `youtube:` **prefix in the URL position** becomes a player. Plain URLs stay plain images — the prefix is what opts in.

```markdown
![](youtube:https://www.youtube.com/watch?v=M5PbLfVGOQs)
```

![](youtube:https://www.youtube.com/watch?v=M5PbLfVGOQs)

## Accepted forms

```markdown
![](youtube:https://www.youtube.com/watch?v=M5PbLfVGOQs)   full URL
![](youtube:https://youtu.be/M5PbLfVGOQs)                  short URL
![](youtube:https://www.youtube.com/shorts/M5PbLfVGOQs)    shorts URL
![](youtube:M5PbLfVGOQs)                                   bare video id
```

## Start timestamps

`?start=` / `?t=` params and `&start=` seconds are honored:

```markdown
![](youtube:https://www.youtube.com/watch?v=M5PbLfVGOQs&start=90)
```

## Behavior

- **Cookie-free**: embeds use `youtube-nocookie.com`
- **Lazy**: `loading="lazy"`, 16:9 aspect ratio, rounded card border
- **Streaming**: while streaming, renders as a "Watch on YouTube" link instead of an iframe
- **Toggle**: `markifyConfig.embeds.youtube = false` renders these as normal images
