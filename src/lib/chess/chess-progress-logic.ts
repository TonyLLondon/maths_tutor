export type ChessOpeningDiscovery = {
  name: string;
  firstSeenAt: string;
  timesReached: number;
};

export type ChessPositionStats = {
  attempts: number;
  wrongCount: number;
  lastAt: string;
};

export type ChessTrainerPrefs = {
  sound: boolean;
};

export type ChessTrainerProgress = {
  bestScore: number;
  lastScore: number;
  gamesPlayed: number;
  openingsDiscovered: ChessOpeningDiscovery[];
  positions: Record<string, ChessPositionStats>;
  prefs: ChessTrainerPrefs;
  lastPlayedDate: string | null;
  playStreakDays: number;
};

export function emptyChessTrainerProgress(): ChessTrainerProgress {
  return {
    bestScore: 0,
    lastScore: 0,
    gamesPlayed: 0,
    openingsDiscovered: [],
    positions: {},
    prefs: { sound: false },
    lastPlayedDate: null,
    playStreakDays: 0,
  };
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function bumpPlayStreak(
  progress: ChessTrainerProgress,
  now = todayUtc(),
): number {
  if (progress.lastPlayedDate === now) return progress.playStreakDays;
  if (progress.lastPlayedDate === yesterdayUtc()) {
    return progress.playStreakDays + 1;
  }
  return 1;
}

export function recordOpeningDiscovery(
  progress: ChessTrainerProgress,
  name: string,
): { progress: ChessTrainerProgress; isFirstTime: boolean } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { progress, isFirstTime: false };
  }
  const existing = progress.openingsDiscovered.find((o) => o.name === trimmed);
  if (existing) {
    const openingsDiscovered = progress.openingsDiscovered.map((o) =>
      o.name === trimmed
        ? { ...o, timesReached: o.timesReached + 1 }
        : o,
    );
    return {
      progress: { ...progress, openingsDiscovered },
      isFirstTime: false,
    };
  }
  const entry: ChessOpeningDiscovery = {
    name: trimmed,
    firstSeenAt: new Date().toISOString(),
    timesReached: 1,
  };
  return {
    progress: {
      ...progress,
      openingsDiscovered: [...progress.openingsDiscovered, entry],
    },
    isFirstTime: true,
  };
}

export function recordPositionAttempt(
  progress: ChessTrainerProgress,
  key: string,
  wrong: boolean,
): ChessTrainerProgress {
  const prev = progress.positions[key];
  const next: ChessPositionStats = {
    attempts: (prev?.attempts ?? 0) + 1,
    wrongCount: (prev?.wrongCount ?? 0) + (wrong ? 1 : 0),
    lastAt: new Date().toISOString(),
  };
  return {
    ...progress,
    positions: { ...progress.positions, [key]: next },
  };
}

export function recordRoundComplete(
  progress: ChessTrainerProgress,
  score: number,
): ChessTrainerProgress {
  const now = todayUtc();
  const streak = bumpPlayStreak(progress, now);
  return {
    ...progress,
    lastScore: score,
    bestScore: Math.max(progress.bestScore, score),
    gamesPlayed: progress.gamesPlayed + 1,
    lastPlayedDate: now,
    playStreakDays: streak,
  };
}

export function formatOpeningCount(count: number): string {
  if (count <= 0) return "";
  return count === 1 ? "1 opening played" : `${count} openings played`;
}

export function formatChessSubjectStats(progress: ChessTrainerProgress): string {
  const parts: string[] = [];
  if (progress.bestScore > 0) {
    parts.push(`Best score ${progress.bestScore}`);
  }
  const openingLine = formatOpeningCount(progress.openingsDiscovered.length);
  if (openingLine) {
    parts.push(openingLine);
  }
  if (progress.playStreakDays > 1) {
    parts.push(`${progress.playStreakDays}-day streak`);
  }
  return parts.join(" · ");
}
