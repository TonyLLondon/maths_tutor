import type { ChessTrainerProgress } from "./chess-progress-logic";

export type ChessTrickySpot = {
  attempts: number;
  wrongCount: number;
  label: string;
};

export function chessTrickySpots(
  progress: ChessTrainerProgress,
  limit = 5,
): ChessTrickySpot[] {
  return Object.values(progress.positions)
    .filter((p) => p.wrongCount >= 2 && p.attempts >= 2)
    .sort((a, b) => b.wrongCount - a.wrongCount || b.attempts - a.attempts)
    .slice(0, limit)
    .map((p) => ({
      attempts: p.attempts,
      wrongCount: p.wrongCount,
      label: `Missed ${p.wrongCount} of ${p.attempts} tries at one opening step`,
    }));
}
