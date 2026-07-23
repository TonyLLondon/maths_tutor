import type { ChessTrainerProgress } from "@/lib/chess/chess-progress-logic";
import { formatChessSubjectStats } from "@/lib/chess/chess-progress-logic";

type Props = {
  progress: ChessTrainerProgress;
};

export function ChessSubjectStatsLine({ progress }: Props) {
  const line = formatChessSubjectStats(progress);
  if (!line) return null;
  return (
    <p className="mt-2 text-sm font-medium text-blue-800">{line}</p>
  );
}
