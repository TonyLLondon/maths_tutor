import { Chess } from "chess.js";

export type BookMove = {
  san: string;
  uci: string;
  white: number;
  draws: number;
  black: number;
};

export type ExplorerResponse = {
  moves: BookMove[];
  opening?: { name: string; eco?: string } | null;
  source: "lichess" | "fallback";
};

export function legalMovesFallback(fen: string, limit = 15): BookMove[] {
  const chess = new Chess(fen);
  return chess.moves({ verbose: true }).slice(0, limit).map((m) => ({
    san: m.san,
    uci: `${m.from}${m.to}${m.promotion ?? ""}`,
    white: 0,
    draws: 0,
    black: 0,
  }));
}

export function topBookMoves(moves: BookMove[], count = 3): BookMove[] {
  return moves.slice(0, Math.min(count, moves.length));
}
