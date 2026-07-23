import { Chess } from "chess.js";
import { NextResponse } from "next/server";
import {
  legalMovesFallback,
  type ExplorerResponse,
} from "@/lib/chess/explorer-types";

export async function GET(request: Request) {
  const fen = new URL(request.url).searchParams.get("fen");
  if (!fen) {
    return NextResponse.json({ error: "fen is required" }, { status: 400 });
  }

  try {
    new Chess(fen);
  } catch {
    return NextResponse.json({ error: "invalid fen" }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const token = process.env.LICHESS_EXPLORER_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      "[chess/explorer] LICHESS_EXPLORER_TOKEN is not set — using legal-move fallback",
    );
  }

  try {
    const upstream = await fetch(
      `https://explorer.lichess.org/lichess?fen=${encodeURIComponent(fen)}`,
      { headers, cache: "no-store" },
    );
    if (upstream.ok) {
      const data = (await upstream.json()) as ExplorerResponse;
      return NextResponse.json({
        moves: data.moves ?? [],
        opening: data.opening ?? null,
        source: "lichess" as const,
      });
    }
    const errText = await upstream.text();
    console.warn(
      `[chess/explorer] Lichess upstream ${upstream.status} for fen=${fen.slice(0, 32)}…`,
      errText.slice(0, 120),
    );
  } catch (err) {
    console.warn("[chess/explorer] Lichess upstream error", err);
  }

  const body: ExplorerResponse = {
    moves: legalMovesFallback(fen),
    opening: null,
    source: "fallback",
  };
  return NextResponse.json(body);
}
