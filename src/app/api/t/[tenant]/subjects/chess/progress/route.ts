import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  emptyChessTrainerProgress,
  getChessTrainerProgress,
  saveChessTrainerProgress,
  type ChessTrainerProgress,
} from "@/lib/chess/chess-progress";
import { isTenantId } from "@/lib/tenants";

type Ctx = { params: Promise<{ tenant: string }> };

function mergeProgress(
  base: ChessTrainerProgress,
  incoming: ChessTrainerProgress,
): ChessTrainerProgress {
  const openingsByName = new Map(
    base.openingsDiscovered.map((o) => [o.name, o]),
  );
  for (const o of incoming.openingsDiscovered) {
    const prev = openingsByName.get(o.name);
    if (!prev) {
      openingsByName.set(o.name, o);
      continue;
    }
    openingsByName.set(o.name, {
      name: o.name,
      firstSeenAt: prev.firstSeenAt,
      timesReached: Math.max(prev.timesReached, o.timesReached),
    });
  }

  const positions = { ...base.positions };
  for (const [key, stats] of Object.entries(incoming.positions)) {
    const prev = positions[key];
    if (!prev) {
      positions[key] = stats;
      continue;
    }
    positions[key] = {
      attempts: Math.max(prev.attempts, stats.attempts),
      wrongCount: Math.max(prev.wrongCount, stats.wrongCount),
      lastAt:
        prev.lastAt > stats.lastAt ? prev.lastAt : stats.lastAt,
    };
  }

  return {
    bestScore: Math.max(base.bestScore, incoming.bestScore),
    lastScore: incoming.lastScore,
    gamesPlayed: Math.max(base.gamesPlayed, incoming.gamesPlayed),
    openingsDiscovered: [...openingsByName.values()].sort((a, b) =>
      a.firstSeenAt.localeCompare(b.firstSeenAt),
    ),
    positions,
    prefs: incoming.prefs,
    lastPlayedDate: incoming.lastPlayedDate ?? base.lastPlayedDate,
    playStreakDays: Math.max(base.playStreakDays, incoming.playStreakDays),
  };
}

export async function GET(_req: Request, { params }: Ctx) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  let session;
  try {
    session = await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getChessTrainerProgress(session.userId);
  return NextResponse.json({ progress });
}

export async function POST(request: Request, { params }: Ctx) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  let session;
  try {
    session = await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { progress?: ChessTrainerProgress };
  const incoming = body.progress;
  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await getChessTrainerProgress(session.userId);
  const merged = mergeProgress(existing, {
    ...emptyChessTrainerProgress(),
    ...incoming,
    prefs: {
      ...emptyChessTrainerProgress().prefs,
      ...incoming.prefs,
    },
  });
  await saveChessTrainerProgress(session.userId, merged);
  return NextResponse.json({ progress: merged });
}
