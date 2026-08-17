# Callouts & Blockquotes

Markify supports GitHub / Obsidian-style callout alerts with semantic icons, plus plain styled blockquotes.

## 1. Callout Alerts

Write a callout by starting a blockquote with a `> [!TYPE]` marker. Types are **case-insensitive** (`[!info]` works too).

```markdown
> [!TIP]
> Use callouts to highlight important tips in AI responses.
```

## 2. Supported Types

| Type | Accent color | Icon | Title |
|---|---|---|---|
| `NOTE` | blue | PencilSimple | Note |
| `TIP` · `HINT` | emerald | Flame | Tip / Hint |
| `IMPORTANT` | violet | Flame | Important |
| `WARNING` · `ATTENTION` | amber | Warning | Warning / Attention |
| `CAUTION` | orange | Warning | Caution |
| `INFO` | sky | Info | Info |
| `SUCCESS` | green | CheckCircle | Success |
| `QUESTION` | indigo | Question | Question |
| `ABSTRACT` | slate | ListChecks | Abstract |
| `TODO` | teal | CheckSquare | Todo |
| `FAILURE` | red | XCircle | Failure |
| `DANGER` | rose | WarningDiamond | Danger |
| `BUG` | red | Bug | Bug |
| `EXAMPLE` | purple | Flask | Example |
| `QUOTE` | slate | Quotes | Quote |

Each callout renders as a tinted card with a colored left border. The title row (icon + bold text) inherits the type's accent color, and the icons use Phosphor's **duotone** weight.

### Aliases

Obsidian aliases share the icon of their parent type:

| Alias | Behaves like | Icon |
|---|---|---|
| `HINT` | `TIP` | Flame |
| `IMPORTANT` | `TIP` | Flame |
| `ATTENTION` | `WARNING` | Warning |
| `CAUTION` | `WARNING` | Warning |

Aliases keep their own title and accent color (`CAUTION` stays orange, `IMPORTANT` stays violet), only the icon is shared.

## 3. Examples

> [!NOTE]
> This is a helpful note alert.

> [!TIP]
> This is a tip alert.

> [!IMPORTANT]
> This is an important alert.

> [!WARNING]
> Always validate user input before rendering Markdown.

> [!CAUTION]
> This action cannot be undone.

> [!INFO]
> Some additional information.

> [!SUCCESS]
> Everything worked.

> [!QUESTION]
> Why does this work?

> [!ABSTRACT]
> Here is a short summary.

> [!TODO]
> This still needs to be done.

> [!FAILURE]
> Something went wrong.

> [!DANGER]
> This is dangerous.

> [!BUG]
> This is a known bug.

> [!EXAMPLE]
> Here is an example.

> [!QUOTE]
> A memorable quote goes here.

## 4. Plain Blockquotes

A blockquote **without** a `[!TYPE]` marker renders as a subtle, italicized quotation, distinct from the callout cards:

```markdown
> A plain blockquote stays a blockquote.
```

## 5. Nested Content

Callouts render any Markdown content Markify supports, including bold, links, lists, images, code, and more:

```markdown
> [!TIP]
> Images can live inside callouts too:
>
> ![alt](image.png)
```