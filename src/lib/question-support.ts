export type QuestionSupportEntry = {
  /** One short nudge — must not reveal the answer. */
  hint: string;
  /** Kid-readable mini lesson (markdown). */
  help: string;
};

export type QuestionSupportFile = {
  version: 1;
  questions: Record<string, QuestionSupportEntry>;
};

export type ClientQuestionSupport = QuestionSupportEntry;
