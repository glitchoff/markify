# Chess

Interactive chess, enabled with `chess.enabled: true` in config. Two block types:

## PGN viewer

` ```pgn ` / ` ```chess ` blocks render a full game viewer:

```pgn
[Event "A Night at the Opera"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5
6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5
11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6
15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0
```

## FEN board

` ```fen ` blocks render an interactive board:

```fen
r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3
```

## Interactions

| PGN viewer | FEN board |
|---|---|
| Score-sheet move grid (desktop) / chess.com-style strip (mobile) | Drag pieces to move |
| First / prev / next / last navigation | Click a piece, then a destination |
| Board flip (button or `F` key) | Flip board (⇅) |
| Position slider | Reset with move counter badge |
| Keyboard: `←` `→` `Home` `End` | Code/board toggle |
| PGN copy & download | FEN copy |

## Parsing details

- **Comments** (`{...}`) render as inline italic notes; **NAGs** (`$1` …) render as glyphs (`!`, `?`, `!?` …)
- **Variations** `(...)` are skipped — the mainline is kept
- Illegal/unparseable SAN moves are tolerated in lenient mode
- **Streaming**: PGN/FEN wait for the complete game before rendering (incomplete input is ambiguous), showing a "waiting" state meanwhile
- **Invalid input** renders an error card with the source shown

## Configuration

```ts
markifyConfig.chess = {
  enabled: true,
  maxWidth: 420,      // max board width in px
  showNotation: true, // coordinate labels on squares
};
```
