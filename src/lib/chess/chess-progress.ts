import { kvGet, kvSet } from "@/lib/kv";
import {
  emptyChessTrainerProgress,
  type ChessTrainerProgress,
} from "@/lib/chess/chess-progress-logic";

export type {
  ChessOpeningDiscovery,
  ChessPositionStats,
  ChessTrainerPrefs,
  ChessTrainerProgress,
} from "@/lib/chess/chess-progress-logic";

export {
  emptyChessTrainerProgress,
  bumpPlayStreak,
  recordOpeningDiscovery,
  recordPositionAttempt,
  recordRoundComplete,
  formatChessSubjectStats,
} from "@/lib/chess/chess-progress-logic";

export function chessProgressKey(userId: string): string {
  return `mt:user:${userId}:chess:opening-trainer`;
}

export async function getChessTrainerProgress(
  userId: string,
): Promise<ChessTrainerProgress> {
  const data = await kvGet<ChessTrainerProgress>(chessProgressKey(userId));
  if (!data) return emptyChessTrainerProgress();
  return {
    ...emptyChessTrainerProgress(),
    ...data,
    prefs: { ...emptyChessTrainerProgress().prefs, ...data.prefs },
    openingsDiscovered: data.openingsDiscovered ?? [],
    positions: data.positions ?? {},
  };
}

export async function saveChessTrainerProgress(
  userId: string,
  progress: ChessTrainerProgress,
): Promise<void> {
  await kvSet(chessProgressKey(userId), progress);
}
