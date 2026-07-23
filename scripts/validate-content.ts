/**
 * Validates maths topic worksheets and answer keys.
 * Run: npm run content:validate
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  parseQuestions,
  resolveAnswerKind,
  type AnswerEntry,
} from "../src/lib/questions.ts";

const ROOT = path.join(import.meta.dirname, "..");
const CONTENT_TENANT = process.env.CONTENT_TENANT ?? "archer";
const TOPICS = path.join(
  ROOT,
  "content/tenants",
  CONTENT_TENANT,
  "subjects/maths/topics",
);
const SPINE = path.join(ROOT, "src/lib/topics/spine.json");

type Spine = { topics: { code: string; domain: string }[] };

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function main() {
  const spine = JSON.parse(fs.readFileSync(SPINE, "utf8")) as Spine;
  const errors: string[] = [];
  let worksheets = 0;

  for (const t of spine.topics) {
    const md = path.join(TOPICS, t.domain, `${t.code}.md`);
    const aj = path.join(TOPICS, t.domain, `${t.code}.answers.json`);
    if (!fs.existsSync(md)) {
      errors.push(`missing worksheet ${t.domain}/${t.code}.md`);
      continue;
    }
    if (!fs.existsSync(aj)) {
      errors.push(`missing answers ${t.domain}/${t.code}.answers.json`);
      continue;
    }
    worksheets++;
    const parsed = matter(fs.readFileSync(md, "utf8"));
    const questions = parseQuestions(parsed.content);
    const key = JSON.parse(fs.readFileSync(aj, "utf8")) as {
      answers: Record<string, AnswerEntry>;
    };
    const supportPath = path.join(TOPICS, t.domain, `${t.code}.support.json`);
    if (!fs.existsSync(supportPath)) {
      errors.push(`missing support ${t.domain}/${t.code}.support.json`);
      continue;
    }
    const support = JSON.parse(fs.readFileSync(supportPath, "utf8")) as {
      questions: Record<string, { hint?: string; help?: string }>;
    };
    const ids = questions.map((q) => q.id);
    const qSet = new Set(ids);
    const aSet = new Set(Object.keys(key.answers));

    if (questions.length < 10) {
      errors.push(
        `${t.domain}/${t.code}: need at least 10 questions for practice, got ${questions.length}`,
      );
    }
    for (let i = 0; i < ids.length; i++) {
      const n = parseInt(ids[i], 10);
      if (n !== i + 1) {
        errors.push(`${t.domain}/${t.code}: question ids not continuous 1..n`);
        break;
      }
    }
    for (const id of qSet) {
      if (!aSet.has(id)) {
        errors.push(`${t.domain}/${t.code}: no answer for question ${id}`);
      }
      const sup = support.questions?.[id];
      if (!sup?.hint?.trim()) {
        errors.push(`${t.domain}/${t.code} Q${id}: missing hint in support.json`);
      } else if (sup.hint.trim().length > 220) {
        errors.push(
          `${t.domain}/${t.code} Q${id}: hint too long (${sup.hint.trim().length} chars, max 220)`,
        );
      }
      if (!sup?.help?.trim()) {
        errors.push(`${t.domain}/${t.code} Q${id}: missing help article in support.json`);
      } else if (sup.help.trim().length < 60) {
        errors.push(
          `${t.domain}/${t.code} Q${id}: help article too short (min 60 chars)`,
        );
      }
    }
    for (const id of aSet) {
      if (!qSet.has(id)) {
        errors.push(`${t.domain}/${t.code}: orphan answer id ${id}`);
      }
    }
    for (const id of Object.keys(support.questions ?? {})) {
      if (!qSet.has(id)) {
        errors.push(`${t.domain}/${t.code}: orphan support id ${id}`);
      }
    }
    for (const q of questions) {
      const entry = key.answers[q.id];
      if (!entry) continue;
      const rating = entry.rating;
      if (rating == null || typeof rating !== "number" || !Number.isInteger(rating)) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: missing or invalid rating in answer key`,
        );
      } else if (rating < 500 || rating > 2000) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: rating ${rating} outside 500–2000`,
        );
      }
      if (entry.any) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: legacy any:true — run migrate-answer-kinds.py`,
        );
      }
      const kind = resolveAnswerKind(entry);
      if (kind === "bar-chart" && !entry.bars) {
        errors.push(`${t.domain}/${t.code} Q${q.id}: bar-chart missing bars`);
      }
    }
    const topicRatings = ids
      .map((id) => key.answers[id]?.rating)
      .filter((r): r is number => typeof r === "number");
    if (topicRatings.length === ids.length && ids.length > 0) {
      const minR = Math.min(...topicRatings);
      const maxR = Math.max(...topicRatings);
      if (minR > 650) {
        errors.push(
          `${t.domain}/${t.code}: no age-7 band — lowest rating ${minR} (need ≤650; add ## Getting started)`,
        );
      }
      if (maxR < 1900) {
        errors.push(
          `${t.domain}/${t.code}: no GCSE-hard band — highest rating ${maxR} (need ≥1900; add ## Stretch)`,
        );
      }
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(e);
    fail(`${errors.length} validation error(s)`);
  }
  console.log(`OK: ${worksheets}/${spine.topics.length} topics validated`);
}

main();
