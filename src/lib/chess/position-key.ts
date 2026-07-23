/** Stable key for “this position” stats (ignores halfmove/fullmove counters). */
export function positionKeyFromFen(fen: string): string {
  const norm =
    fen === "start"
      ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      : fen;
  const parts = norm.split(" ");
  return parts.slice(0, 4).join(" ");
}
