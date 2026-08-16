# Chess (PGN & FEN Viewers)

Markify can render interactive chess from two formats: **PGN** (full games with moves) and **FEN** (single board positions). Both are lazy-loaded and only fetched when a matching code block appears.

Chess rendering is **opt-in**. Pass the `chessEnabled` prop to `<Markify>`:

```tsx
<Markify chessEnabled isStreaming={isStreaming}>
  {markdown}
</Markify>
```

Without `chessEnabled`, `pgn`/`chess`/`fen` fences render as plain code blocks.

## 1. PGN Usage

Wrap your PGN in a fenced code block with the `pgn` (or `chess`) language tag:

````markdown
```pgn
[Event "Kasparov vs Topalov, Immortal Game"]
[Site "Wijk aan Zee NED"]
[Date "1999.01.20"]
[Round "4"]
[White "Kasparov, Garry"]
[Black "Topalov, Veselin"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 O-O
6. O-O-O Nc6 7. Nf3 e5 8. dxe5 dxe5 9. Qxd8 Rxd8
10. Nxe5 Nxe5 11. Bg5 Rg8 12. Nd5 Ne7 13. Kb1 Nxd5
14. exd5 Nf4 15. g3 Nxg2 16. Bxg8 Nf4 17. Kc2 Rxg8
18. h4 Ne6 19. Be3 Nf4 20. c4 a5 21. h5 Re8 22. hxg6
fxg6 23. d6+ Kf7 24. Kd2 Nxg6 25. Bxb6 Re4 26. c5 a4
27. Bxa4 Rxa4 28. Kc3 Rxd6 29. cxd6 Kf6 30. d7 Ke7
31. d8=Q+ Kxd8 32. Rh1 Nf4 33. Rxb7 Kc8 34. Ra7 Nh3
35. Ra8+ Kc7 36. Rxh7 Nf4 37. Kc4 Ne2 38. Rc7+ Kb6
39. Re7 Nf4 40. Rxe4 Nh3 41. Re3 Kc5 42. Re7 Nf4
43. Kd3 Ne6 44. Ke4 Nc7 45. Rh7 Nd5 46. Kd4 Nf4
47. Re7 Nc6 48. Kc4 Nf4 49. b4 Kd7 50. Rh7 Kc6
51. Rh8 Ne6 52. Kd4 Kb6 53. b5 Ka5 54. Rc8 Nc7
55. b6 Na6 56. Kc4 Nc7 57. Kd4 Nb5+ 58. Kc4 Nd6+
59. Kc5 Nf5 60. b7 Nd6 61. b8=Q+ Nb7+ 62. Kc6 Nd6
63. Qb6+ Ka4 64. Qc5 Nf5 65. Kb6 Nc7 66. Qxa5+
```
````

The block is converted into an interactive viewer with:

- A rendered **chessboard** at the current position
- **Move navigation** (first / previous / next / last, plus a slider)
- A clickable **move list** (with move numbers)
- **Board flip** to view from Black's perspective
- **Copy** and **download** (`.pgn`) actions
- Automatic **check / checkmate / draw** status
- Last-move highlighting

### Live example

Here's a live PGN viewer:

```pgn
[Event "Italian Game"]
[Site "Markify Demo"]
[White "White"]
[Black "Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Be7 5. O-O O-O
6. Re1 d6 7. c3 Na5 8. Bb5 c6 9. Ba4 Nc4 10. b3 Nb6
```

## 2. FEN Usage

A **FEN** (Forsyth-Edwards Notation) string describes a single board position. Wrap it in a `fen` fence to render a board-only viewer:

````markdown
```fen
r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 3 3
```
````

The FEN viewer shows:

- A rendered **chessboard** for the position
- **Board flip** to view from Black's perspective
- **Copy** action
- A **code/preview toggle** to view the raw FEN or the board
- **Status label** (side to move, check, checkmate)

### Live example

```fen
r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 3 3
```

## 3. Standalone Components

You can also use the viewers directly without Markdown by importing from the `@glitchoff/markify/chess` entry point.

### ChessGame (PGN)

```tsx
import { ChessGame } from "@glitchoff/markify/chess";

const pgn = `
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7
6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7
`;

export function GameViewer() {
  return <ChessGame pgn={pgn} showNotation />;
}
```

#### ChessGame Props

| Prop            | Type      | Default | Description                               |
| --------------- | --------- | ------- | ----------------------------------------- |
| `pgn`           | `string`  | —       | The PGN source to render.                 |
| `showNotation`  | `boolean` | `true`  | Show square coordinates on the board.     |
| `className`     | `string`  | —       | Additional classes for the container.     |
| `isStreaming`   | `boolean` | `false` | While `true`, shows a loading placeholder until the full PGN arrives. |

### FenBoard (FEN)

```tsx
import { FenBoard } from "@glitchoff/markify/chess";

export function PositionViewer() {
  return (
    <FenBoard
      fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 3 3"
      maxWidth={420}
    />
  );
}
```

#### FenBoard Props

| Prop            | Type      | Default | Description                                          |
| --------------- | --------- | ------- | ---------------------------------------------------- |
| `fen`           | `string`  | —       | The FEN string to render.                            |
| `showNotation`  | `boolean` | `true`  | Show square coordinates on the board.                |
| `maxWidth`      | `number`  | `420`   | Max board width in px. The card shrinks to fit.      |
| `isStreaming`   | `boolean` | `false` | While `true`, renders progressively as FEN streams.  |
| `className`     | `string`  | —       | Additional classes for the container.                |

Both components are available from the `@glitchoff/markify/chess` entry point.

## 4. Bundle Size & Code Splitting

The chess viewer is **lazy-loaded**. Markify only fetches `chess.js` and
`react-chessboard` when a `pgn`/`chess`/`fen` code block actually appears on screen,
so the core bundle stays lean if you never render a chess game. The
standalone `@glitchoff/markify/chess` entry point is also a separate chunk you
can import on demand.

## 5. Notes

- Invalid PGN renders a friendly error with the raw source instead of crashing.
- During streaming, PGN blocks wait for the full game before rendering (incomplete PGN is ambiguous). FEN blocks render **progressively** — pieces appear on the board as they stream in.