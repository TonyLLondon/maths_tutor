import type { ExplorerResponse } from "@/lib/chess/explorer-types";
import { legalMovesFallback } from "@/lib/chess/explorer-types";

function startFen(fen: string): string {
  return fen === "start"
    ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    : fen;
}

export async function fetchOpeningExplorer(
  fen: string,
): Promise<ExplorerResponse> {
  const boardFen = startFen(fen);

  try {
    const response = await fetch(
      `/api/chess/explorer?fen=${encodeURIComponent(boardFen)}`,
    );
    if (!response.ok) {
      throw new Error("explorer request failed");
    }
    const data = (await response.json()) as ExplorerResponse;
    if (data.source === "lichess" && data.moves?.length) {
      return data;
    }
    if (data.source === "lichess" && !data.moves?.length) {
      return {
        moves: legalMovesFallback(boardFen),
        opening: data.opening ?? null,
        source: "fallback",
      };
    }
    return data;
  } catch {
    return {
      moves: legalMovesFallback(boardFen),
      opening: null,
      source: "fallback",
    };
  }
}
