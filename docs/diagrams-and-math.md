# Math (KaTeX)

Inline and display math render via KaTeX (`remark-math` + `rehype-katex`).

## Syntax

Write inline math wrapped in single dollar signs `$…$`, and standalone blocks wrapped in double dollar signs on their own lines:

````markdown
Einstein's formula: $E = mc^2$
````

````markdown
$$
f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi)\, e^{2\pi i \xi x}\, d\xi
$$
````

Rendered inline: Einstein's formula: $E = mc^2$

Rendered block:

$$
f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi)\, e^{2\pi i \xi x}\, d\xi
$$

## Boxed results and frames

```latex
\boxed{\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}}
```

$$
\boxed{\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}}
$$

```latex
f(x) = \begin{cases}
  x^2 & \text{if } x \geq 0 \\
  -x^2 & \text{if } x < 0
\end{cases}
\qquad
\boxed{\max_{x \in D} f(x)}
```

$$
f(x) = \begin{cases}
  x^2 & \text{if } x \geq 0 \\
  -x^2 & \text{if } x < 0
\end{cases}
\qquad
\boxed{\max_{x \in D} f(x)}
$$

## Aligned derivations

```latex
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
```

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

## Step-by-step flow with annotations

```latex
\begin{aligned}
(x + 2)^2 &= x^2 + 4x + 4 && \text{expand} \\
&= (x^2 + 4x) + 4 && \text{regroup} \\
&= (x+2)^2 && \text{factor} \\
\Rightarrow \quad \boxed{x = -2} &&& \text{root}
\end{aligned}
```

$$
\begin{aligned}
(x + 2)^2 &= x^2 + 4x + 4 && \text{expand} \\
&= (x^2 + 4x) + 4 && \text{regroup} \\
&= (x+2)^2 && \text{factor} \\
\Rightarrow \quad \boxed{x = -2} &&& \text{root}
\end{aligned}
$$

Equation tags with `\tag`:

```latex
i\hbar \frac{\partial}{\partial t} \Psi = \hat{H}\Psi
\tag{Schrödinger}
```

$$
i\hbar \frac{\partial}{\partial t} \Psi = \hat{H}\Psi
\tag{Schrödinger}
$$

## Matrices and vectors

```latex
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{pmatrix} x \\ y \end{pmatrix}
=
\begin{pmatrix} ax + by \\ cx + dy \end{pmatrix},
\qquad
\det \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} = -2
```

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{pmatrix} x \\ y \end{pmatrix}
=
\begin{pmatrix} ax + by \\ cx + dy \end{pmatrix},
\qquad
\det \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} = -2
$$

```latex
\begin{Vmatrix} 1 & 0 \\ 0 & 1 \end{Vmatrix} = \mathbb{I}
```

$$
\begin{Vmatrix} 1 & 0 \\ 0 & 1 \end{Vmatrix} = \mathbb{I}
$$

## Arrows and flow annotations

```latex
a \xrightarrow{\text{multiply by } 2} b
\xrightarrow[\text{or subtract}]{\text{add } 1} c
\iff d \implies e
```

$$
a \xrightarrow{\text{multiply by } 2} b
\xrightarrow[\text{or subtract}]{\text{add } 1} c
\iff d \implies e
$$

```latex
\begin{aligned}
\text{input } u(t) \;&\longrightarrow\; \boxed{\text{system}} \;\longrightarrow\; y(t) \\
y(t) \;&\xmapsto{\;H(s)\;} \hat{y}(t)
\end{aligned}
```

$$
\begin{aligned}
\text{input } u(t) \;&\longrightarrow\; \boxed{\text{system}} \;\longrightarrow\; y(t) \\
y(t) \;&\xmapsto{\;H(s)\;} \hat{y}(t)
\end{aligned}
$$

## Sums, products, limits, and series

```latex
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6},
\qquad
\prod_{k=1}^{n} k = n!,
\qquad
\lim_{x \to 0} \frac{\sin x}{x} = 1
```

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6},
\qquad
\prod_{k=1}^{n} k = n!,
\qquad
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

```latex
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}
```

$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}
$$

## Callout-worthy identities

```latex
\boxed{e^{i\pi} + 1 = 0}
```

$$
\boxed{e^{i\pi} + 1 = 0}
$$

```latex
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887\ldots
```

$$
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887\ldots
$$

## Fractions, radicals, and typography

```latex
\frac{d}{dx}\left[ \sqrt[3]{x^2 + 1} \right]
= \frac{2x}{3\sqrt[3]{(x^2 + 1)^2}},
\qquad
\tfrac{1}{2} \oplus \tfrac{1}{3} = \tfrac{5}{6}
```

$$
\frac{d}{dx}\left[ \sqrt[3]{x^2 + 1} \right]
= \frac{2x}{3\sqrt[3]{(x^2 + 1)^2}},
\qquad
\tfrac{1}{2} \oplus \tfrac{1}{3} = \tfrac{5}{6}
$$

```latex
\overbrace{1 + 2 + \cdots + n}^{\text{n terms}} = \frac{n(n+1)}{2}
```

$$
\overbrace{1 + 2 + \cdots + n}^{\text{n terms}} = \frac{n(n+1)}{2}
$$

Inline accents:

```markdown
$\hat{y}$, $\bar{x}$, $\vec{v}$, $\tilde{f}$, $\widehat{AB}$, and $x^\star$
```

Inline accents work too: $\hat{y}$, $\bar{x}$, $\vec{v}$, $\tilde{f}$, $\widehat{AB}$, and $x^\star$.

## How it works

- `remark-math` parses `$…$` and `$$…$$`, `rehype-katex` renders them with KaTeX
- `katex/dist/katex.min.css` is imported by `config.tsx` (remove if you load it globally)
- **Normalization**: the common single-line form `$$a + b$$` is parsed as *inline* math by remark-math and never centers. Markify rewrites it into the multi-line form so display math centers properly. Fenced code blocks are skipped.
- **Unicode fixes**: a small remark plugin normalizes non-breaking spaces, unicode hyphens, and bullet characters inside math nodes so KaTeX doesn't error on AI-written math
- **Streaming**: math delimiters are left untouched during repair — partial equations render correctly the moment the closing delimiter arrives
