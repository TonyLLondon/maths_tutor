import { Chess } from "chess.js";
import type { Arrow } from "react-chessboard";
import type { BookMove } from "@/lib/chess/explorer-types";

export const DEFAULT_TOTAL_PLIES = 20;
/** @deprecated Use state.totalPlies or DEFAULT_TOTAL_PLIES */
export const TOTAL_PLIES = DEFAULT_TOTAL_PLIES;

export const PLY_MILESTONES = [5, 10, 15] as const;

export type TrainerPhase =
  | "boot"
  | "waiting-opponent"
  | "your-turn"
  | "checking"
  | "well-done"
  | "pick-move"
  | "done";

export type HistoryStep = {
  fen: string;
  san?: string;
};

export type TrainerState = {
  fen: string;
  playerColor: "w" | "b";
  phase: TrainerPhase;
  score: number;
  pliesPlayed: number;
  topMoves: BookMove[];
  highlightedSquares: string[];
  feedbackColor: "green" | "red" | null;
  arrows: Arrow[];
  arrowsAreFaded: boolean;
  openingName: string | null;
  lastOpeningName: string | null;
  lastMilestone: number;
  usingFallbackMoves: boolean;
  wellDoneFenBefore: string | null;
  playedMoveSan: string | null;
  moveHistory: HistoryStep[];
  historyIndex: number;
  totalPlies: number;
  animateNextPosition: boolean;
  lastPlyMilestone: number;
};

export type TrainerAction =
  | { type: "boot"; playerColor: "w" | "b"; totalPlies: number }
  | {
      type: "set-fen";
      fen: string;
      pliesPlayed: number;
      phase: TrainerPhase;
      san?: string;
      animate?: boolean;
    }
  | { type: "set-opening"; name: string | null }
  | { type: "set-fallback"; value: boolean }
  | { type: "checking" }
  | {
      type: "correct-move";
      topMoves: BookMove[];
      from: string;
      to: string;
      fenBeforeMove: string;
      fenAfterMove: string;
      playedSan: string;
    }
  | {
      type: "wrong-move";
      topMoves: BookMove[];
      from: string;
      to: string;
      fenBeforeMove: string;
    }
  | { type: "finish-feedback" }
  | { type: "enter-pick-move" }
  | { type: "picked-move"; fen: string; san: string }
  | { type: "set-milestone"; value: number }
  | { type: "fade-arrows" }
  | { type: "clear-arrows" }
  | { type: "show-hint"; topMoves: BookMove[]; fenBefore: string }
  | { type: "clear-hint" }
  | { type: "set-ply-milestone"; value: number }
  | { type: "clear-animate-flag" }
  | { type: "history-back" }
  | { type: "history-forward" }
  | { type: "history-to-live" }
  | { type: "reset" };

export function createInitialTrainerState(): TrainerState {
  return {
    fen: "start",
    playerColor: "w",
    phase: "boot",
    score: 0,
    pliesPlayed: 0,
    topMoves: [],
    highlightedSquares: [],
    feedbackColor: null,
    arrows: [],
    arrowsAreFaded: false,
    openingName: null,
    lastOpeningName: null,
    lastMilestone: 0,
    usingFallbackMoves: false,
    wellDoneFenBefore: null,
    playedMoveSan: null,
    moveHistory: [],
    historyIndex: -1,
    totalPlies: DEFAULT_TOTAL_PLIES,
    animateNextPosition: false,
    lastPlyMilestone: 0,
  };
}

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function normalizeFen(fen: string): string {
  return fen === "start" ? START_FEN : fen;
}

function appendHistory(
  history: HistoryStep[],
  fen: string,
  san?: string,
): HistoryStep[] {
  const norm = normalizeFen(fen);
  const last = history[history.length - 1];
  if (last?.fen === norm && last?.san === san) return history;
  return [...history, { fen: norm, san }];
}

function withLiveHistory(
  state: TrainerState,
  fen: string,
  san?: string,
): Pick<TrainerState, "moveHistory" | "historyIndex"> {
  const moveHistory = appendHistory(state.moveHistory, fen, san);
  return { moveHistory, historyIndex: moveHistory.length - 1 };
}

function chessFromFen(fen: string): Chess {
  return new Chess(fen === "start" ? undefined : fen);
}

function bookMoveArrows(
  moves: BookMove[],
  fen: string,
  palette: "green" | "gold",
): Arrow[] {
  return moves
    .map((bookMove, idx) => {
      const temp = chessFromFen(fen);
      const moveObj = temp.move(bookMove.san);
      if (!moveObj) return null;
      const color =
        palette === "green"
          ? idx === 0
            ? "rgb(0, 255, 0)"
            : "rgb(34, 197, 94)"
          : idx === 0
            ? "rgb(255, 215, 0)"
            : "rgb(234, 179, 8)";
      return {
        startSquare: moveObj.from,
        endSquare: moveObj.to,
        color,
      };
    })
    .filter(Boolean) as Arrow[];
}

export function trainerReducer(
  state: TrainerState,
  action: TrainerAction,
): TrainerState {
  switch (action.type) {
    case "boot": {
      const start = { fen: START_FEN };
      return {
        ...createInitialTrainerState(),
        playerColor: action.playerColor,
        totalPlies: action.totalPlies,
        phase: action.playerColor === "b" ? "waiting-opponent" : "your-turn",
        fen: "start",
        moveHistory: [start],
        historyIndex: 0,
      };
    }
    case "set-fen": {
      const skipHistory =
        action.phase === "checking" ||
        action.phase === "well-done" ||
        state.phase === "well-done";
      const historyPatch = skipHistory
        ? {}
        : withLiveHistory(state, action.fen, action.san);
      return {
        ...state,
        fen: action.fen,
        pliesPlayed: action.pliesPlayed,
        phase: action.phase,
        topMoves: action.phase === "your-turn" ? [] : state.topMoves,
        highlightedSquares: [],
        feedbackColor: null,
        arrows:
          action.phase === "your-turn" || action.phase === "waiting-opponent"
            ? []
            : state.arrows,
        arrowsAreFaded: false,
        animateNextPosition: action.animate === true,
        ...historyPatch,
      };
    }
    case "set-opening":
      return {
        ...state,
        openingName: action.name,
        lastOpeningName: action.name ?? state.lastOpeningName,
      };
    case "set-fallback":
      return { ...state, usingFallbackMoves: action.value };
    case "checking":
      return { ...state, phase: "checking" };
    case "correct-move":
      return {
        ...state,
        fen: action.fenAfterMove,
        phase: "well-done",
        score: state.score + 5,
        topMoves: action.topMoves,
        highlightedSquares: [action.from, action.to],
        feedbackColor: "green",
        wellDoneFenBefore: action.fenBeforeMove,
        playedMoveSan: action.playedSan,
        arrows: bookMoveArrows(action.topMoves, action.fenBeforeMove, "green"),
        arrowsAreFaded: false,
      };
    case "wrong-move":
      return {
        ...state,
        fen: action.fenBeforeMove,
        phase: "checking",
        score: state.score - 1,
        topMoves: action.topMoves,
        highlightedSquares: [action.from, action.to],
        feedbackColor: "red",
        arrows: bookMoveArrows(action.topMoves, action.fenBeforeMove, "gold"),
        arrowsAreFaded: false,
      };
    case "finish-feedback": {
      const historyPatch = withLiveHistory(
        state,
        state.fen,
        state.playedMoveSan ?? undefined,
      );
      return {
        ...state,
        phase:
          state.pliesPlayed >= state.totalPlies - 1
            ? "done"
            : "waiting-opponent",
        highlightedSquares: [],
        feedbackColor: null,
        pliesPlayed: state.pliesPlayed + 1,
        arrows: [],
        arrowsAreFaded: false,
        wellDoneFenBefore: null,
        playedMoveSan: null,
        ...historyPatch,
      };
    }
    case "enter-pick-move":
      return {
        ...state,
        phase: "pick-move",
        highlightedSquares: [],
        feedbackColor: null,
      };
    case "picked-move": {
      const historyPatch = withLiveHistory(state, action.fen, action.san);
      return {
        ...state,
        fen: action.fen,
        phase: "waiting-opponent",
        topMoves: [],
        pliesPlayed: state.pliesPlayed + 1,
        arrows: [],
        arrowsAreFaded: false,
        ...historyPatch,
      };
    }
    case "history-back":
      return {
        ...state,
        historyIndex: Math.max(0, state.historyIndex - 1),
      };
    case "history-forward":
      return {
        ...state,
        historyIndex: Math.min(
          state.moveHistory.length - 1,
          state.historyIndex + 1,
        ),
      };
    case "history-to-live":
      return {
        ...state,
        historyIndex: Math.max(0, state.moveHistory.length - 1),
      };
    case "set-milestone":
      return { ...state, lastMilestone: action.value };
    case "fade-arrows":
      return { ...state, arrowsAreFaded: true };
    case "clear-arrows":
      return { ...state, arrows: [], arrowsAreFaded: false };
    case "show-hint":
      return {
        ...state,
        score: state.score - 1,
        topMoves: action.topMoves,
        arrows: bookMoveArrows(
          action.topMoves.slice(0, 1),
          action.fenBefore,
          "green",
        ),
        arrowsAreFaded: false,
      };
    case "clear-hint":
      return { ...state, arrows: [], topMoves: [] };
    case "set-ply-milestone":
      return { ...state, lastPlyMilestone: action.value };
    case "clear-animate-flag":
      return { ...state, animateNextPosition: false };
    case "reset":
      return createInitialTrainerState();
    default:
      return state;
  }
}

export function canPlayerDrag(
  phase: TrainerPhase,
  fen: string,
  playerColor: "w" | "b",
  pieceType: string,
  reviewingHistory: boolean,
): boolean {
  if (reviewingHistory) return false;
  if (phase !== "your-turn" && phase !== "pick-move") {
    return false;
  }
  const chess = chessFromFen(fen);
  if (chess.turn() !== playerColor) {
    return false;
  }
  const pieceColor = pieceType.startsWith("w") ? "w" : "b";
  return pieceColor === playerColor;
}

export function fenAfterPlayerPlies(state: TrainerState): string {
  return state.fen;
}
