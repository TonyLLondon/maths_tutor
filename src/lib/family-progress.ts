import type { AccountRecord } from "./accounts";
import { resolveWatchedChildren } from "./accounts";
import { chessTrickySpots } from "./chess/chess-tricky-spots";
import {
  formatChessSubjectStats,
  getChessTrainerProgress,
} from "./chess/chess-progress";
import {
  chessActiveThisWeek,
  formatLastActive,
  formatLastPracticed,
  isQuietTopic,
  lastAttemptAt,
  levelTrendFromHistory,
  topicSlugsTouchedThisWeek,
  type LevelTrend,
} from "./family-insights";
import { getTopicProgressState, type TopicProgressState } from "./progress";
import { formatLevel } from "./practice-rating";

export { formatLastPracticed } from "./family-insights";

export type ChildTopicInsight = {
  userId: string;
  displayName: string;
  level: number;
  levelLabel: string;
  lastPracticedAt: string | null;
  lastPracticedLabel: string;
  trend: LevelTrend;
  trendLabel: string;
  isQuiet: boolean;
};

function insightFromState(
  child: AccountRecord,
  state: TopicProgressState,
): Omit<ChildTopicInsight, never> {
  const lastPracticedAt = lastAttemptAt(state.questions);
  const hasAttempts = Object.keys(state.questions).length > 0;
  const trendInfo = levelTrendFromHistory(
    state.ratingHistory,
    state.rating,
    hasAttempts,
  );
  return {
    userId: child.id,
    displayName: child.displayName,
    level: state.rating,
    levelLabel: formatLevel(state.rating),
    lastPracticedAt,
    lastPracticedLabel: formatLastPracticed(lastPracticedAt),
    trend: trendInfo.trend,
    trendLabel: trendInfo.label,
    isQuiet: isQuietTopic(lastPracticedAt),
  };
}

export function formatLastPlayedDay(day: string | null): string {
  if (!day) return "Not played yet";
  return formatLastPracticed(`${day}T12:00:00.000Z`);
}

export async function getChildTopicInsights(
  parent: AccountRecord,
  subject: string,
  topicPath: string,
): Promise<ChildTopicInsight[]> {
  const children = await resolveWatchedChildren(parent);
  return Promise.all(
    children.map(async (child) => {
      const state = await getTopicProgressState(child.id, subject, topicPath);
      return insightFromState(child, state);
    }),
  );
}

export type ChildChessInsight = {
  userId: string;
  displayName: string;
  bestScore: number;
  lastScore: number;
  gamesPlayed: number;
  playStreakDays: number;
  lastPlayedLabel: string;
  summaryLine: string;
  openings: { name: string; timesReached: number }[];
  trickySpots: ReturnType<typeof chessTrickySpots>;
  activeThisWeek: boolean;
};

export async function getChildChessInsights(
  parent: AccountRecord,
): Promise<ChildChessInsight[]> {
  const children = await resolveWatchedChildren(parent);
  return Promise.all(
    children.map(async (child) => {
      const progress = await getChessTrainerProgress(child.id);
      const openings = [...progress.openingsDiscovered]
        .sort((a, b) => b.timesReached - a.timesReached)
        .map((o) => ({ name: o.name, timesReached: o.timesReached }));
      return {
        userId: child.id,
        displayName: child.displayName,
        bestScore: progress.bestScore,
        lastScore: progress.lastScore,
        gamesPlayed: progress.gamesPlayed,
        playStreakDays: progress.playStreakDays,
        lastPlayedLabel: formatLastPlayedDay(progress.lastPlayedDate),
        summaryLine: formatChessSubjectStats(progress),
        openings,
        trickySpots: chessTrickySpots(progress),
        activeThisWeek: chessActiveThisWeek(progress.lastPlayedDate),
      };
    }),
  );
}

export type ChildHomeSummary = {
  userId: string;
  displayName: string;
  lastActiveLabel: string;
  mathsTopicsThisWeek: number;
  chessActiveThisWeek: boolean;
  chessGamesPlayed: number;
};

export async function loadChildHomeSummaries(
  parent: AccountRecord,
  worksheetSlugs: string[],
): Promise<ChildHomeSummary[]> {
  const children = await resolveWatchedChildren(parent);
  return Promise.all(
    children.map(async (child) => {
      const states = new Map<string, TopicProgressState>();
      let mathsLast: string | null = null;
      for (const slug of worksheetSlugs) {
        const state = await getTopicProgressState(child.id, "maths", slug);
        states.set(slug, state);
        const last = lastAttemptAt(state.questions);
        if (last && (!mathsLast || last > mathsLast)) mathsLast = last;
      }
      const chess = await getChessTrainerProgress(child.id);
      return {
        userId: child.id,
        displayName: child.displayName,
        lastActiveLabel: formatLastActive(mathsLast, chess.lastPlayedDate),
        mathsTopicsThisWeek: topicSlugsTouchedThisWeek(states),
        chessActiveThisWeek: chessActiveThisWeek(chess.lastPlayedDate),
        chessGamesPlayed: chess.gamesPlayed,
      };
    }),
  );
}

export type FamilyTopicRow = {
  domain: string;
  code: string;
  slug: string;
  label: string;
  isStarter: boolean;
  insight: ChildTopicInsight;
};

export async function loadFamilyMathsForChild(
  child: AccountRecord,
  entries: {
    domain: string;
    code: string;
    label: string;
    isStarter: boolean;
  }[],
): Promise<FamilyTopicRow[]> {
  return Promise.all(
    entries.map(async ({ domain, code, label, isStarter }) => {
      const slug = `${domain}/${code}`;
      const state = await getTopicProgressState(child.id, "maths", slug);
      return {
        domain,
        code,
        slug,
        label,
        isStarter,
        insight: insightFromState(child, state),
      };
    }),
  );
}

/** @deprecated use loadFamilyMathsForChild per child */
export async function loadFamilyMathsTopicRows(
  parent: AccountRecord,
  entries: { domain: string; code: string; label: string }[],
): Promise<
  {
    domain: string;
    code: string;
    slug: string;
    label: string;
    children: ChildTopicInsight[];
  }[]
> {
  const children = await resolveWatchedChildren(parent);
  if (children.length === 0) return [];

  return Promise.all(
    entries.map(async ({ domain, code, label }) => {
      const slug = `${domain}/${code}`;
      const childInsights = await Promise.all(
        children.map(async (child) => {
          const state = await getTopicProgressState(child.id, "maths", slug);
          return insightFromState(child, state);
        }),
      );
      return { domain, code, slug, label, children: childInsights };
    }),
  );
}
