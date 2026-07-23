export type ParsedQuestion = {
  id: string;
  text: string;
  section: string;
};

export type AnswerEntry = {
  display: string;
  accept: string[];
  /** Match if normalized user answer includes any accept string */
  contains?: boolean;
  /** Any non-empty answer counts as correct (e.g. design-your-own) */
  any?: boolean;
};

export type AnswerKey = {
  version: 1;
  answers: Record<string, AnswerEntry>;
};

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
      current = { id: m[1], text: m[2].trim(), section };
      continue;
    }
    if (current && line.trim() && !line.startsWith("|")) {
      current.text += ` ${line.trim()}`;
    }
  }
  flush();
  return questions;
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
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
  if (entry.any) {
    return { correct: trimmed.length > 0, display };
  }
  if (!trimmed) {
    return { correct: false, display };
  }
  const normUser = normalizeAnswer(trimmed);
  for (const raw of entry.accept) {
    const normAccept = normalizeAnswer(raw);
    if (entry.contains) {
      if (normUser.includes(normAccept)) {
        return { correct: true, display };
      }
    } else if (normUser === normAccept) {
      return { correct: true, display };
    }
  }
  return { correct: false, display };
}
