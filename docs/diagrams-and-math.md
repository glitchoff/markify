# Math Support (KaTeX)

Markify renders LaTeX math equations via KaTeX using `remark-math` and `rehype-katex`.

## 1. Import KaTeX CSS

Include the KaTeX stylesheet in your application layout:

```tsx
import "katex/dist/katex.min.css";
```

## 2. Inline Math

Write inline equations wrapped in single dollar signs `$`:

```markdown
Einstein's formula: $E = mc^2$
```

Rendered inline: Einstein's formula: $E = mc^2$

## 3. Block Math

Write standalone math blocks wrapped in double dollar signs `$$`:

```markdown
$$
f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi) e^{2\pi i \xi x} d\xi
$$
```

Rendered block:

$$
f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi) e^{2\pi i \xi x} d\xi
$$

## 4. Notes

- Math is rendered with `rehype-katex`; no additional runtime is required beyond the CSS import above.
- KaTeX output is normalized for Unicode via Markify's `remarkFixKaTeXUnicode` plugin.