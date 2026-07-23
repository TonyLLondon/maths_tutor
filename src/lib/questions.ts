import { effectiveQuestionRating } from "./practice-rating";

export type QuestionTier = 1 | 2 | 3;

export type ParsedQuestion = {
  id: string;
  text: string;
  section: string;
  tier: QuestionTier;
};

export type AnswerKind = "text" | "self-check" | "bar-chart";

export type BarChartSpec = {
  labels: string[];
  heights: number[];
};

export type AnswerEntry = {
  display: string;
  accept: string[];
  kind?: AnswerKind;
  /** Chess-style difficulty 900–2200; GCSE hard ≈ 2000 */
  rating?: number;
  /** @deprecated use rating; 1 = easier, 2 = medium, 3 = harder */
  tier?: QuestionTier;
  /** Match if normalized user answer includes accept strings (see containsMin). */
  contains?: boolean;
  /** When contains is true, how many accept strings must appear (default: 1, or 2 if several clues). */
  containsMin?: number;
  /** @deprecated use kind: "self-check" */
  any?: boolean;
  bars?: BarChartSpec;
};

export type AnswerKey = {
  version: 1;
  answers: Record<string, AnswerEntry>;
};

export type ClientAnswerMeta = {
  kind: AnswerKind;
  display: string;
  bars?: BarChartSpec;
  rating: number;
};

export function resolveAnswerKind(entry: AnswerEntry): AnswerKind {
  if (entry.kind) return entry.kind;
  if (entry.bars) return "bar-chart";
  if (entry.any) return "self-check";
  return "text";
}

export function toClientAnswerMeta(
  entry: AnswerEntry,
  questionId: string,
  sectionTier: QuestionTier,
): ClientAnswerMeta {
  const tier = entry.tier ?? sectionTier;
  return {
    kind: resolvePracticeInputKind(entry),
    display: entry.display,
    bars: entry.bars,
    rating: effectiveQuestionRating(entry.rating, tier, questionId),
  };
}

/** Kids always type (or use bar-chart widgets); no self-mark flows. */
export function resolvePracticeInputKind(entry: AnswerEntry): AnswerKind {
  if (entry.bars || entry.kind === "bar-chart") return "bar-chart";
  return "text";
}

function requiredContainsHits(entry: AnswerEntry): number {
  if (entry.containsMin != null && entry.containsMin > 0) {
    return entry.containsMin;
  }
  if (!entry.contains) return 1;
  if (entry.accept.length <= 1) return 1;
  return Math.min(2, entry.accept.length);
}

export function tierFromSection(section: string): QuestionTier {
  const s = section.toLowerCase();
  if (s.includes("getting started")) return 1;
  if (s.includes("fluency") || s.includes("more fluency")) return 1;
  if (s.includes("reasoning") || s.includes("mixed")) return 2;
  return 3;
}

export function effectiveTier(
  entry: AnswerEntry | undefined,
  sectionTier: QuestionTier,
): QuestionTier {
  return entry?.tier ?? sectionTier;
}

export function parseQuestions(markdownBody: string): ParsedQuestion[] {
  const lines = markdownBody.split("\n");
  const questions: ParsedQuestion[] = [];
  let section = "";
  let current: ParsedQuestion | null = null;

  const flush = () => {
    if (current) {
      questions.push(current);
      current = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith("---") || line.startsWith("*GCSE")) break;
    if (line.startsWith("## ")) {
      flush();
      section = line.replace(/^##\s+/, "").trim();
      continue;
    }
    const m = line.match(/^(\d+)\.\s+(.+)/);
    if (m) {
      flush();
      current = {
        id: m[1],
        text: m[2].trim(),
        section,
        tier: tierFromSection(section),
      };
      continue;
    }
    if (current && line.trim()) {
      if (line.startsWith("|")) {
        current.text += `\n${line}`;
      } else {
        current.text += ` ${line.trim()}`;
      }
    }
  }
  flush();
  return questions;
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u2212/g, "-")
    .replace(/\s+/g, " ")
    .replace(/£|,/g, "")
    .replace(/\*\*/g, "")
    .trim();
}

export function gradeAnswer(
  entry: AnswerEntry,
  userAnswer: string,
): { correct: boolean; display: string } {
  const display = entry.display;
  const trimmed = userAnswer.trim();
  if (!trimmed) {
    return { correct: false, display };
  }
  const normUser = normalizeAnswer(trimmed);

  if (
    entry.accept.length === 0 &&
    (entry.kind === "self-check" || entry.any)
  ) {
    const ok = normUser.length >= 12;
    return { correct: ok, display };
  }

  if (entry.contains) {
    const need = requiredContainsHits(entry);
    let hits = 0;
    for (const raw of entry.accept) {
      const normAccept = normalizeAnswer(raw);
      if (normAccept && normUser.includes(normAccept)) hits += 1;
    }
    if (hits >= need) {
      return { correct: true, display };
    }
    return { correct: false, display };
  }

  for (const raw of entry.accept) {
    if (normUser === normalizeAnswer(raw)) {
      return { correct: true, display };
    }
  }
  return { correct: false, display };
}

export function gradeBarChart(
  entry: AnswerEntry,
  heights: number[],
): { correct: boolean; display: string } {
  const spec = entry.bars;
  const display = entry.display;
  if (!spec || heights.length !== spec.heights.length) {
    return { correct: false, display };
  }
  const ok = spec.heights.every((h, i) => heights[i] === h);
  return { correct: ok, display };
}

export function gradeSelfCheck(
  entry: AnswerEntry,
  gotIt: boolean,
): { correct: boolean; display: string } {
  return { correct: gotIt, display: entry.display };
}

export type PracticeSubmitBody = {
  questionId: string;
  answer?: string;
  selfCheckCorrect?: boolean;
  barHeights?: number[];
};

export function gradePracticeAttempt(
  entry: AnswerEntry,
  body: PracticeSubmitBody,
): { correct: boolean; display: string } {
  if (resolvePracticeInputKind(entry) === "bar-chart") {
    return gradeBarChart(entry, body.barHeights ?? []);
  }
  return gradeAnswer(entry, body.answer ?? "");
}
