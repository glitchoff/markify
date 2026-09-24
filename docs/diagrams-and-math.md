# Math (KaTeX)

Inline and display math render via KaTeX.

## Inline math

Inline math like $E = mc^2$ flows naturally inside a sentence.

## Display math

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## How it works

- `remark-math` parses `$…$` and `$$…$$`, `rehype-katex` renders them with KaTeX
- `katex/dist/katex.min.css` is imported by `config.tsx` (remove if you load it globally)
- **Normalization**: the common single-line form `$$a + b$$` is parsed as *inline* math by remark-math and never centers. Markify rewrites it into the multi-line form so display math centers properly. Fenced code blocks are skipped.
- **Unicode fixes**: a small remark plugin normalizes non-breaking spaces, unicode hyphens, and bullet characters inside math nodes so KaTeX doesn't error on AI-written math
- **Streaming**: math delimiters are left untouched during repair — partial equations render correctly the moment the closing delimiter arrives

## Extensive KaTeX usage

Everything KaTeX supports works — including boxed expressions, aligned derivations, annotations, matrices, and chemical-style flows.

### Boxed results and frames

$$
\boxed{\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}}
$$

$$
f(x) = \begin{cases}
  x^2 & \text{if } x \geq 0 \\
  -x^2 & \text{if } x < 0
\end{cases}
\qquad
\boxed{\max_{x \in D} f(x)}
$$

### Aligned derivations

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

### Step-by-step flow with annotations

$$
\begin{aligned}
(x + 2)^2 &= x^2 + 4x + 4 && \text{expand} \\
&= (x^2 + 4x) + 4 && \text{regroup} \\
&= (x+2)^2 && \text{factor} \\
\Rightarrow \quad \boxed{x = -2} &&& \text{root}
\end{aligned}
$$

Annotations with `\tag`:

$$
i\hbar \frac{\partial}{\partial t} \Psi = \hat{H}\Psi
\tag{Schrödinger}
$$

### Matrices and vectors

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{pmatrix} x \\ y \end{pmatrix}
=
\begin{pmatrix} ax + by \\ cx + dy \end{pmatrix},
\qquad
\det \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} = -2
$$

$$
\begin{Vmatrix} 1 & 0 \\ 0 & 1 \end{Vmatrix} = \mathbb{I}
$$

### Arrows and flow annotations

$$
a \xrightarrow{\text{multiply by } 2} b
\xrightarrow[\text{or subtract}]{\text{add } 1} c
\iff d \implies e
$$

$$
\begin{aligned}
\text{input } u(t) \;&\longrightarrow\; \boxed{\text{system}} \;\longrightarrow\; y(t) \\
y(t) \;&\xmapsto{\;H(s)\;} \hat{y}(t)
\end{aligned}
$$

### Sums, products, limits, and series

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6},
\qquad
\prod_{k=1}^{n} k = n!,
\qquad
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}
$$

### Callout-worthy identities

$$
\boxed{e^{i\pi} + 1 = 0}
$$

$$
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887\ldots
$$

### Fractions, radicals, and typography

$$
\frac{d}{dx}\left[ \sqrt[3]{x^2 + 1} \right]
= \frac{2x}{3\sqrt[3]{(x^2 + 1)^2}},
\qquad
\tfrac{1}{2} \oplus \tfrac{1}{3} = \tfrac{5}{6}
$$

$$
\overbrace{1 + 2 + \cdots + n}^{\text{n terms}} = \frac{n(n+1)}{2}
$$

Inline accents work too: $\hat{y}$, $\bar{x}$, $\vec{v}$, $\tilde{f}$, $\widehat{AB}$, and $x^\star$.
