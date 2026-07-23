export type ChessLevel = "gentle" | "standard";

export const PLIES_BY_LEVEL: Record<ChessLevel, number> = {
  gentle: 14,
  standard: 20,
};

export function totalPliesForLevel(level: ChessLevel | undefined): number {
  return PLIES_BY_LEVEL[level ?? "standard"];
}

export function parseChessLevel(value: unknown): ChessLevel {
  return value === "gentle" ? "gentle" : "standard";
}
