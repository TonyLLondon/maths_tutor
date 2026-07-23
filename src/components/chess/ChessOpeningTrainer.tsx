"use client";

import {
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  type CSSProperties,
} from "react";
import { Chess, type Square } from "chess.js";
import type { Arrow } from "react-chessboard";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/chess/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/chess/ui/card";
import { Progress } from "@/components/chess/ui/progress";
import { Separator } from "@/components/chess/ui/separator";
import confetti from "canvas-confetti";
import { fetchOpeningExplorer } from "@/lib/chess/explorer-client";
import { topBookMoves } from "@/lib/chess/explorer-types";
import { resolveColorChoice, type PlayerColor } from "@/lib/chess/player-color-preference";
import { OpeningNameFlyover } from "@/components/chess/OpeningNameFlyover";
import { saveChessProgress } from "@/lib/chess/chess-progress-client";
import {
  recordOpeningDiscovery,
  recordPositionAttempt,
  recordRoundComplete,
  type ChessTrainerProgress,
} from "@/lib/chess/chess-progress-logic";
import { positionKeyFromFen } from "@/lib/chess/position-key";
import {
  playCorrectSound,
  playHintSound,
  playMilestoneSound,
  playMoveSound,
} from "@/lib/chess/chess-sounds";
import {
  PLY_MILESTONES,
  canPlayerDrag,
  createInitialTrainerState,
  trainerReducer,
  type TrainerPhase,
} from "@/lib/chess/opening-trainer-reducer";

type ColorChoice = PlayerColor | "random";

const WELL_DONE_SHOW_MS = 4500;
const WELL_DONE_FADE_MS = 3200;
/** Pause before the computer plays so the player is not rushed. */
const OPPONENT_PAUSE_MS = 2800;

const HINT_FLASH_MS = 1000;
const FALLBACK_WARN_AFTER = 2;

function chessFromFen(fen: string): Chess {
  return new Chess(fen === "start" ? undefined : fen);
}

type ChessOpeningTrainerProps = {
  tenant: string;
  displayName: string;
  totalPlies: number;
  initialProgress: ChessTrainerProgress;
};

export function ChessOpeningTrainer({
  tenant,
  displayName,
  totalPlies,
  initialProgress,
}: ChessOpeningTrainerProps) {
  const [state, dispatch] = useReducer(
    trainerReducer,
    undefined,
    createInitialTrainerState,
  );
  const [sessionColor, setSessionColor] = useState<PlayerColor | null>(null);
  const bootedRef = useRef(false);
  const opponentBusyRef = useRef(false);
  const opponentTurnKeyRef = useRef<string | null>(null);
  const roundCompleteConfettiRef = useRef(false);
  const boardSlotRef = useRef<HTMLDivElement>(null);
  const openingSidebarRef = useRef<HTMLParagraphElement>(null);
  const lastAnimatedOpeningRef = useRef<string | null>(null);
  const [boardPx, setBoardPx] = useState(0);
  const [flyingOpeningName, setFlyingOpeningName] = useState<string | null>(
    null,
  );
  const [openingSlotPulse, setOpeningSlotPulse] = useState(false);
  const [flyIsFirstDiscovery, setFlyIsFirstDiscovery] = useState(true);
  const [savedProgress, setSavedProgress] =
    useState<ChessTrainerProgress>(initialProgress);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintUsedKeys, setHintUsedKeys] = useState<Set<string>>(() => new Set());

  const progressRef = useRef(savedProgress);

  useEffect(() => {
    progressRef.current = savedProgress;
  }, [savedProgress]);

  const pendingOpeningRef = useRef<{
    name: string;
    isFirstTime: boolean;
  } | null>(null);
  const lastProcessedOpeningRef = useRef<string | null>(null);
  const consecutiveFallbackRef = useRef(0);
  const roundSavedRef = useRef(false);
  const bestAtRoundStartRef = useRef(initialProgress.bestScore);
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);

  const noteExplorerSource = useCallback((source: "lichess" | "fallback") => {
    if (source === "fallback") {
      consecutiveFallbackRef.current += 1;
      setShowFallbackBanner(
        consecutiveFallbackRef.current >= FALLBACK_WARN_AFTER,
      );
    } else {
      consecutiveFallbackRef.current = 0;
      setShowFallbackBanner(false);
    }
  }, []);

  const measureBoardSlot = useCallback(() => {
    const el = boardSlotRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const next = Math.floor(Math.min(width, height));
    if (next > 0) {
      setBoardPx((prev) => (prev === next ? prev : next));
    }
  }, []);

  useLayoutEffect(() => {
    if (!sessionColor) return;
    const run = () => measureBoardSlot();
    run();
    const el = boardSlotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sessionColor, measureBoardSlot]);

  const persistProgress = useCallback(
    async (next: ChessTrainerProgress) => {
      progressRef.current = next;
      setSavedProgress(next);
      const saved = await saveChessProgress(tenant, next);
      if (saved) {
        progressRef.current = saved;
        setSavedProgress(saved);
      }
    },
    [tenant],
  );

  const openingFlyBlocked = useCallback(
    (phase: TrainerPhase) =>
      phase === "well-done" ||
      phase === "checking" ||
      phase === "pick-move",
    [],
  );

  const startOpeningFly = useCallback(
    (name: string, isFirstDiscovery: boolean) => {
      if (name === lastAnimatedOpeningRef.current) return;
      lastAnimatedOpeningRef.current = name;
      if (!isFirstDiscovery) {
        setOpeningSlotPulse(true);
        window.setTimeout(() => setOpeningSlotPulse(false), 700);
        return;
      }
      setFlyIsFirstDiscovery(true);
      setFlyingOpeningName(name);
    },
    [],
  );

  const completeOpeningFly = useCallback(() => {
    setFlyingOpeningName(null);
    setOpeningSlotPulse(true);
    window.setTimeout(() => setOpeningSlotPulse(false), 700);
  }, []);

  const beginGame = useCallback(
    (playerColor: PlayerColor) => {
      opponentBusyRef.current = false;
      opponentTurnKeyRef.current = null;
      roundCompleteConfettiRef.current = false;
      roundSavedRef.current = false;
      lastAnimatedOpeningRef.current = null;
      lastProcessedOpeningRef.current = null;
      pendingOpeningRef.current = null;
      setHintUsedKeys(new Set());
      consecutiveFallbackRef.current = 0;
      bestAtRoundStartRef.current = progressRef.current.bestScore;
      setFlyingOpeningName(null);
      setOpeningSlotPulse(false);
      setRoundMessage(null);
      dispatch({ type: "reset" });
      dispatch({ type: "boot", playerColor, totalPlies });
    },
    [totalPlies],
  );

  useEffect(() => {
    if (openingFlyBlocked(state.phase)) return;
    const pending = pendingOpeningRef.current;
    if (!pending) return;
    pendingOpeningRef.current = null;
    startOpeningFly(pending.name, pending.isFirstTime);
  }, [state.phase, openingFlyBlocked, startOpeningFly]);

  useEffect(() => {
    const name = state.openingName;
    if (!name || name === lastProcessedOpeningRef.current) return;
    lastProcessedOpeningRef.current = name;
    const { progress: next, isFirstTime } = recordOpeningDiscovery(
      progressRef.current,
      name,
    );
    void persistProgress(next);

    if (openingFlyBlocked(state.phase)) {
      pendingOpeningRef.current = { name, isFirstTime };
      return;
    }
    startOpeningFly(name, isFirstTime);
  }, [
    state.openingName,
    state.phase,
    openingFlyBlocked,
    persistProgress,
    startOpeningFly,
  ]);

  const pickSessionColor = (choice: ColorChoice) => {
    const playerColor = resolveColorChoice(choice);
    setSessionColor(playerColor);
    bootedRef.current = true;
    beginGame(playerColor);
  };

  const runOpponentMove = useCallback(
    async (fen: string, pliesPlayed: number, isFirstWhiteMove: boolean) => {
      if (opponentBusyRef.current) return;
      opponentBusyRef.current = true;
      try {
        const data = await fetchOpeningExplorer(fen);
        noteExplorerSource(data.source);
        dispatch({
          type: "set-fallback",
          value: data.source === "fallback",
        });
        if (data.opening?.name) {
          dispatch({ type: "set-opening", name: data.opening.name });
        }

        const poolSize = isFirstWhiteMove ? 15 : 3;
        const pool = data.moves.slice(0, Math.min(poolSize, data.moves.length));
        if (pool.length === 0) {
          dispatch({
            type: "set-fen",
            fen,
            pliesPlayed,
            phase: pliesPlayed >= totalPlies ? "done" : "your-turn",
          });
          return;
        }

        const pick = pool[Math.floor(Math.random() * pool.length)];
        const board = chessFromFen(fen);
        board.move(pick.san);
        const nextPlies = pliesPlayed + 1;

        dispatch({
          type: "set-fen",
          fen: board.fen(),
          pliesPlayed: nextPlies,
          phase: nextPlies >= totalPlies ? "done" : "your-turn",
          san: pick.san,
          animate: true,
        });
        if (progressRef.current.prefs.sound) {
          playMoveSound();
        }
      } finally {
        opponentBusyRef.current = false;
      }
    },
    [noteExplorerSource, totalPlies],
  );

  useEffect(() => {
    if (state.phase !== "waiting-opponent") return;
    const fen = state.fen === "start" ? chessFromFen("start").fen() : state.fen;
    const turnKey = `${fen}:${state.pliesPlayed}`;
    if (opponentTurnKeyRef.current === turnKey) return;
    opponentTurnKeyRef.current = turnKey;

    const isFirstWhiteMove =
      state.playerColor === "b" && state.pliesPlayed === 0;
    const pliesPlayed = state.pliesPlayed;
    const pauseTimer = window.setTimeout(() => {
      void runOpponentMove(fen, pliesPlayed, isFirstWhiteMove);
    }, OPPONENT_PAUSE_MS);

    return () => {
      window.clearTimeout(pauseTimer);
    };
  }, [state.phase, state.fen, state.pliesPlayed, state.playerColor, runOpponentMove]);

  useEffect(() => {
    if (state.phase !== "well-done") return;
    const fadeTimer = window.setTimeout(() => {
      dispatch({ type: "fade-arrows" });
    }, WELL_DONE_FADE_MS);
    const doneTimer = window.setTimeout(() => {
      dispatch({ type: "finish-feedback" });
    }, WELL_DONE_SHOW_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "checking" || state.feedbackColor !== "red") return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "enter-pick-move" });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.feedbackColor]);

  useEffect(() => {
    const fen = state.fen === "start" ? chessFromFen("start").fen() : state.fen;
    void fetchOpeningExplorer(fen).then((data) => {
      noteExplorerSource(data.source);
      dispatch({
        type: "set-fallback",
        value: data.source === "fallback",
      });
      if (data.opening?.name) {
        dispatch({ type: "set-opening", name: data.opening.name });
      }
    });
  }, [state.fen, noteExplorerSource]);

  useEffect(() => {
    if (!state.animateNextPosition) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "clear-animate-flag" });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state.animateNextPosition, state.fen]);

  useEffect(() => {
    for (const milestone of PLY_MILESTONES) {
      if (milestone > state.totalPlies) continue;
      if (
        state.pliesPlayed >= milestone &&
        state.lastPlyMilestone < milestone
      ) {
        dispatch({ type: "set-ply-milestone", value: milestone });
        if (progressRef.current.prefs.sound) {
          playMilestoneSound();
        }
        confetti({
          particleCount: 40 + milestone * 4,
          spread: 50,
          startVelocity: 28,
          origin: { y: 0.65 },
        });
      }
    }
  }, [state.pliesPlayed, state.lastPlyMilestone, state.totalPlies]);

  useEffect(() => {
    if (state.phase !== "done" || roundSavedRef.current) return;
    if (state.pliesPlayed < state.totalPlies) return;
    roundSavedRef.current = true;

    const next = recordRoundComplete(progressRef.current, state.score);
    void persistProgress(next);

    const isNewBest = state.score > bestAtRoundStartRef.current;
    setRoundMessage(
      isNewBest
        ? `New best score, ${displayName}!`
        : `Nice work, ${displayName}!`,
    );

    if (roundCompleteConfettiRef.current) return;
    roundCompleteConfettiRef.current = true;
    confetti({
      particleCount: isNewBest ? 180 : 120,
      spread: isNewBest ? 130 : 100,
      startVelocity: isNewBest ? 50 : 40,
      origin: { y: 0.6 },
    });
  }, [
    state.phase,
    state.pliesPlayed,
    state.totalPlies,
    state.score,
    displayName,
    persistProgress,
  ]);

  useEffect(() => {
    const getMilestone = (s: number) => {
      if (s < 10) return 0;
      if (s < 25) return 10;
      return Math.floor(s / 25) * 25;
    };
    const current = getMilestone(state.score);
    if (current > state.lastMilestone && current > 0) {
      const n = current === 10 ? 1 : current / 25 + 1;
      confetti({
        particleCount: 30 + (n - 1) * 40,
        spread: 40 + (n - 1) * 20,
        startVelocity: 20 + (n - 1) * 10,
        origin: { y: 0.6 },
      });
      dispatch({ type: "set-milestone", value: current });
    }
  }, [state.score, state.lastMilestone]);

  const onDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    piece: unknown;
    sourceSquare: string;
    targetSquare: string | null;
  }) => {
    if (!targetSquare) return false;
    const liveIdx = Math.max(0, state.moveHistory.length - 1);
    if (state.historyIndex >= 0 && state.historyIndex < liveIdx) {
      dispatch({ type: "history-to-live" });
      return false;
    }
    if (state.phase !== "your-turn" && state.phase !== "pick-move") {
      return false;
    }

    const fenBefore = state.fen === "start" ? chessFromFen("start").fen() : state.fen;
    const board = chessFromFen(fenBefore);

    if (board.turn() !== state.playerColor) {
      return false;
    }

    let move;
    try {
      move = board.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });
    } catch {
      return false;
    }
    if (!move) return false;

    if (state.phase === "pick-move") {
      const ok = state.topMoves.some((m) => m.san === move.san);
      if (!ok) return false;
      const posKey = positionKeyFromFen(fenBefore);
      void persistProgress(
        recordPositionAttempt(progressRef.current, posKey, false),
      );
      dispatch({ type: "picked-move", fen: board.fen(), san: move.san });
      return true;
    }

    const fenAfter = board.fen();

    if (state.pliesPlayed >= state.totalPlies - 1) {
      dispatch({
        type: "set-fen",
        fen: fenAfter,
        pliesPlayed: state.pliesPlayed + 1,
        phase: "done",
      });
      return true;
    }

    const freeFirstWhiteMove =
      state.pliesPlayed === 0 && state.playerColor === "w";

    if (freeFirstWhiteMove) {
      if (progressRef.current.prefs.sound) {
        playMoveSound();
      }
      dispatch({
        type: "set-fen",
        fen: fenAfter,
        pliesPlayed: state.pliesPlayed + 1,
        phase: "waiting-opponent",
        san: move.san,
      });
      dispatch({ type: "clear-arrows" });
      return true;
    }

    dispatch({ type: "checking" });
    dispatch({
      type: "set-fen",
      fen: fenAfter,
      pliesPlayed: state.pliesPlayed,
      phase: "checking",
    });

    void (async () => {
      const data = await fetchOpeningExplorer(fenBefore);
      noteExplorerSource(data.source);
      dispatch({
        type: "set-fallback",
        value: data.source === "fallback",
      });
      const topThree = topBookMoves(data.moves, 3);
      const isCorrect = topThree.some((m) => m.san === move.san);
      const posKey = positionKeyFromFen(fenBefore);
      const nextProgress = recordPositionAttempt(
        progressRef.current,
        posKey,
        !isCorrect,
      );
      void persistProgress(nextProgress);

      if (isCorrect) {
        if (progressRef.current.prefs.sound) {
          playCorrectSound();
        }
        dispatch({
          type: "correct-move",
          topMoves: topThree,
          from: sourceSquare,
          to: targetSquare,
          fenBeforeMove: fenBefore,
          fenAfterMove: fenAfter,
          playedSan: move.san,
        });
      } else {
        dispatch({
          type: "wrong-move",
          topMoves: topThree,
          from: sourceSquare,
          to: targetSquare,
          fenBeforeMove: fenBefore,
        });
      }
    })();

    return true;
  };

  const startNewGame = () => {
    if (!sessionColor) return;
    beginGame(sessionColor);
  };

  const requestHint = () => {
    if (hintBusy || state.phase !== "your-turn" || reviewingHistory) return;
    const fenBefore =
      state.fen === "start" ? chessFromFen("start").fen() : state.fen;
    const posKey = positionKeyFromFen(fenBefore);
    if (hintUsedKeys.has(posKey)) return;
    if (state.pliesPlayed === 0 && state.playerColor === "w") return;

    setHintUsedKeys((prev) => new Set(prev).add(posKey));
    setHintBusy(true);
    void (async () => {
      try {
        const data = await fetchOpeningExplorer(fenBefore);
        noteExplorerSource(data.source);
        const topThree = topBookMoves(data.moves, 3);
        if (topThree.length === 0) return;
        dispatch({
          type: "show-hint",
          topMoves: topThree,
          fenBefore,
        });
        if (progressRef.current.prefs.sound) {
          playHintSound();
        }
        window.setTimeout(() => {
          dispatch({ type: "clear-hint" });
        }, HINT_FLASH_MS);
      } finally {
        setHintBusy(false);
      }
    })();
  };

  const toggleSound = () => {
    const next = {
      ...progressRef.current,
      prefs: { sound: !progressRef.current.prefs.sound },
    };
    void persistProgress(next);
  };

  const customSquareStyles: Record<string, CSSProperties> = {};
  state.highlightedSquares.forEach((square) => {
    customSquareStyles[square] = {
      backgroundColor:
        state.feedbackColor === "green"
          ? "rgba(0, 255, 0, 0.4)"
          : "rgba(255, 0, 0, 0.4)",
    };
  });

  if (state.phase === "pick-move") {
    state.topMoves.forEach((bookMove) => {
      const temp = chessFromFen(state.fen);
      const moveObj = temp.move(bookMove.san);
      if (moveObj) {
        customSquareStyles[moveObj.to] = {
          backgroundColor: "rgba(255, 215, 0, 0.6)",
          cursor: "pointer",
        };
      }
    });
  }

  if (
    state.phase === "well-done" &&
    state.wellDoneFenBefore &&
    state.topMoves.length > 0
  ) {
    const beforeFen = state.wellDoneFenBefore;
    state.topMoves.forEach((bookMove) => {
      const temp = chessFromFen(beforeFen);
      const moveObj = temp.move(bookMove.san);
      if (moveObj) {
        const played = bookMove.san === state.playedMoveSan;
        customSquareStyles[moveObj.to] = {
          backgroundColor: played
            ? "rgba(0, 255, 0, 0.55)"
            : "rgba(0, 255, 0, 0.28)",
        };
      }
    });
  }

  const fadeArrowColor = (color: string) => {
    if (color.startsWith("rgb(")) {
      const rgb = color.match(/\d+/g);
      if (rgb) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35)`;
      }
    }
    return color;
  };

  const boardArrows: Arrow[] =
    state.phase === "well-done" ||
    state.phase === "pick-move" ||
    (state.phase === "your-turn" && state.arrows.length > 0)
      ? state.arrows.map((arrow) =>
          state.arrowsAreFaded
            ? { ...arrow, color: fadeArrowColor(arrow.color) }
            : arrow,
        )
      : [];

  const liveHistoryIndex = Math.max(0, state.moveHistory.length - 1);
  const historyIndex =
    state.historyIndex < 0 ? liveHistoryIndex : state.historyIndex;
  const reviewingHistory = historyIndex < liveHistoryIndex;

  const liveBoardFen =
    state.fen === "start" ? chessFromFen("start").fen() : state.fen;

  const boardFen = reviewingHistory
    ? state.moveHistory[historyIndex]?.fen ?? liveBoardFen
    : liveBoardFen;
  const isGameOver = state.phase === "done";
  const progressPct = (state.pliesPlayed / state.totalPlies) * 100;
  const displayOpening = state.openingName || state.lastOpeningName;

  const fenForPlayerTurn =
    state.fen === "start" ? chessFromFen("start").fen() : state.fen;
  const familiarPosition =
    state.phase === "your-turn" &&
    (savedProgress.positions[positionKeyFromFen(fenForPlayerTurn)]?.wrongCount ??
      0) > 0;

  const playerPosKey = positionKeyFromFen(fenForPlayerTurn);
  const hintUsedHere = hintUsedKeys.has(playerPosKey);

  const hintAvailable =
    state.phase === "your-turn" &&
    !reviewingHistory &&
    !(state.pliesPlayed === 0 && state.playerColor === "w") &&
    !hintUsedHere;

  const openingStrip = savedProgress.openingsDiscovered.slice(-10);

  const allowDragging =
    !isGameOver &&
    !reviewingHistory &&
    (state.phase === "your-turn" || state.phase === "pick-move");

  const statusLine =
    reviewingHistory
      ? "Looking back at earlier moves — press Forward to return to now."
      : familiarPosition
        ? "You’ve seen this spot before — take your time."
      : state.phase === "waiting-opponent"
      ? "Computer is thinking…"
      : state.phase === "checking"
        ? "Checking your move…"
        : state.phase === "pick-move"
          ? "Try again — drag one of the yellow arrow moves."
          : state.phase === "well-done"
            ? "These three moves are what strong players pick here."
            : state.phase === "your-turn" &&
              chessFromFen(boardFen).turn() !== state.playerColor
            ? "Wait for the computer to move"
            : null;

  const boardSize = boardPx > 0 ? boardPx : 400;

  if (!sessionColor) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-stone-900">
            Hi {displayName} — pick your colour
          </h2>
          <p className="mt-2 max-w-sm text-sm text-stone-600">
            You keep this colour until you leave Chess and come back.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="min-w-28 bg-stone-100 font-bold text-stone-900 hover:bg-stone-200"
            onClick={() => pickSessionColor("w")}
          >
            White
          </Button>
          <Button
            size="lg"
            className="min-w-28 bg-stone-900 font-bold text-white hover:bg-stone-800"
            onClick={() => pickSessionColor("b")}
          >
            Black
          </Button>
          <Button
            size="lg"
            className="min-w-28 bg-linear-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-500 hover:to-indigo-500"
            onClick={() => pickSessionColor("random")}
          >
            Random
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_--spacing(64)] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_--spacing(72)]">
      <div
        ref={boardSlotRef}
        className="relative flex h-full min-h-0 w-full items-center justify-center"
      >
        <div
          className="relative shrink-0 overflow-hidden rounded-xl bg-stone-200 shadow-lg ring-1 ring-stone-300"
          style={{ width: boardSize, height: boardSize }}
        >
          <Chessboard
            options={{
              id: "OpeningTrainerBoard",
              position: boardFen,
              onPieceDrop: onDrop,
              boardOrientation:
                state.playerColor === "w" ? "white" : "black",
              squareStyles: customSquareStyles,
              allowDragging,
              showAnimations: state.animateNextPosition,
              animationDurationInMs: 280,
              boardStyle: {
                width: boardSize,
                height: boardSize,
              },
              canDragPiece: ({ piece }: { piece: { pieceType: string } }) =>
                canPlayerDrag(
                  state.phase,
                  state.fen,
                  state.playerColor,
                  piece.pieceType,
                  reviewingHistory,
                ),
              arrows: boardArrows,
            }}
          />

          {state.phase === "well-done" ? (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-30 rounded-lg border border-green-300 bg-green-50/95 px-3 py-2 text-center shadow-md backdrop-blur-sm">
              <p className="text-base font-black text-green-700">Well done!</p>
              {state.topMoves.length > 0 ? (
                <p className="mt-1 text-sm text-green-800">
                  You played{" "}
                  <span className="font-bold">{state.playedMoveSan}</span>.
                  Top moves:{" "}
                  {state.topMoves.map((m) => m.san).join(", ")}.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="flex min-h-0 shrink-0 flex-col gap-2 overflow-y-auto pb-1 lg:overflow-hidden lg:pb-0">
        <h1 className="text-lg font-semibold text-stone-900 lg:text-xl">Chess</h1>

        {showFallbackBanner ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
            Using basic moves instead of the opening book right now.
          </p>
        ) : null}

        {savedProgress.bestScore > 0 ? (
          <p className="text-xs font-medium text-stone-600">
            Your best score: {savedProgress.bestScore}
            {savedProgress.openingsDiscovered.length > 0
              ? ` · ${savedProgress.openingsDiscovered.length} opening${
                  savedProgress.openingsDiscovered.length === 1 ? "" : "s"
                } found`
              : ""}
          </p>
        ) : null}

        {openingStrip.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" title="Openings you discovered">
            {openingStrip.map((o) => (
              <span
                key={o.name}
                className="h-2.5 w-2.5 rounded-full bg-purple-400 ring-1 ring-purple-200"
                title={o.name}
              />
            ))}
          </div>
        ) : null}

        {statusLine ? (
          <p className="text-sm font-medium text-stone-600">{statusLine}</p>
        ) : null}

        {state.moveHistory.length > 1 &&
        state.phase !== "well-done" &&
        state.phase !== "checking" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={historyIndex <= 0}
              className="flex-1"
              onClick={() => dispatch({ type: "history-back" })}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={historyIndex >= liveHistoryIndex}
              className="flex-1"
              onClick={() => dispatch({ type: "history-forward" })}
            >
              Forward
            </Button>
          </div>
        ) : null}

        {reviewingHistory && state.moveHistory[historyIndex]?.san ? (
          <p className="text-xs text-stone-600">
            Move: {state.moveHistory[historyIndex].san}
          </p>
        ) : null}

        <div className="min-h-11">
          <p
            ref={openingSidebarRef}
            className={`rounded-md border border-purple-200 bg-purple-50 px-2 py-1.5 text-sm font-semibold leading-snug text-stone-800 transition-[opacity,box-shadow] duration-300 ${
              displayOpening ? "" : "pointer-events-none border-transparent bg-transparent opacity-0"
            } ${flyingOpeningName ? "opacity-0" : ""} ${
              openingSlotPulse
                ? "ring-2 ring-purple-400 ring-offset-2"
                : ""
            }`}
            aria-hidden={!displayOpening}
          >
            {displayOpening || "Opening"}
          </p>
        </div>

        <Card className="border-stone-200 bg-white">
          <CardContent className="space-y-2 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-600">Moves</span>
              <span className="font-bold text-blue-600">
                {isGameOver
                  ? "All done!"
                  : `${state.pliesPlayed} / ${state.totalPlies}`}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-stone-200" />
          </CardContent>
        </Card>

        {state.phase === "well-done" && state.topMoves.length > 0 ? (
          <p className="text-xs text-green-800">
            Green arrows: all three book moves (yours is the brightest square).
          </p>
        ) : null}

        {state.phase === "pick-move" && state.arrows.length > 0 ? (
          <p className="text-xs font-medium text-amber-800">
            Yellow arrows — drag that move on the board.
          </p>
        ) : null}

        {hintAvailable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={hintBusy}
            className="w-full text-xs"
            onClick={requestHint}
          >
            Hint once (−1 point)
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs text-stone-600"
          onClick={toggleSound}
        >
          Sounds: {savedProgress.prefs.sound ? "On" : "Off"}
        </Button>

        <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50">
          <CardHeader className="px-3 py-2 pb-0">
            <CardTitle className="text-center text-[--spacing(2.5)] font-bold uppercase tracking-[0.15em] text-blue-700">
              Your score
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 pt-1 text-center">
            <div className="bg-linear-to-br from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-6xl font-black leading-none text-transparent xl:text-7xl">
              {state.score}
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardContent className="space-y-3 p-3">
            <div className="text-center">
              <p className="text-[--spacing(2.5)] font-semibold uppercase tracking-wide text-stone-500">
                You are playing
              </p>
              <p className="mt-1 text-lg font-bold text-stone-900">
                {state.playerColor === "w" ? "White" : "Black"}
              </p>
            </div>

            <Separator className="bg-stone-200" />

            <Button
              onClick={startNewGame}
              size="sm"
              className="h-10 w-full bg-linear-to-r from-blue-600 to-indigo-600 font-bold hover:from-blue-500 hover:to-indigo-500"
            >
              New game
            </Button>

            {isGameOver ? (
              <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-center">
                <p className="text-lg font-black text-green-700">
                  {roundMessage ?? "Round complete!"}
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Score:{" "}
                  <span className="font-black">{state.score}</span>
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
    {flyingOpeningName ? (
      <OpeningNameFlyover
        key={flyingOpeningName}
        name={flyingOpeningName}
        playerName={displayName}
        isFirstDiscovery={flyIsFirstDiscovery}
        boardSlotRef={boardSlotRef}
        sidebarSlotRef={openingSidebarRef}
        onComplete={completeOpeningFly}
      />
    ) : null}
    </>
  );
}
