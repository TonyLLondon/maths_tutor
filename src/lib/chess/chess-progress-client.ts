import type { ChessTrainerProgress } from "@/lib/chess/chess-progress-logic";

export async function fetchChessProgress(
  tenant: string,
): Promise<ChessTrainerProgress | null> {
  const res = await fetch(`/api/t/${tenant}/subjects/chess/progress`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { progress: ChessTrainerProgress };
  return data.progress;
}

export async function saveChessProgress(
  tenant: string,
  progress: ChessTrainerProgress,
): Promise<ChessTrainerProgress | null> {
  const res = await fetch(`/api/t/${tenant}/subjects/chess/progress`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { progress: ChessTrainerProgress };
  return data.progress;
}
