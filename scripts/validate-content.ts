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
const TOPICS = path.join(
  ROOT,
  "content/tenants/archer/subjects/maths/topics",
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
    const ids = questions.map((q) => q.id);
    const qSet = new Set(ids);
    const aSet = new Set(Object.keys(key.answers));

    if (questions.length < 28 || questions.length > 36) {
      errors.push(
        `${t.domain}/${t.code}: expected 28–36 questions, got ${questions.length}`,
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
    }
    for (const id of aSet) {
      if (!qSet.has(id)) {
        errors.push(`${t.domain}/${t.code}: orphan answer id ${id}`);
      }
    }
    for (const q of questions) {
      const entry = key.answers[q.id];
      if (!entry) continue;
      if (entry.tier == null) {
        errors.push(`${t.domain}/${t.code} Q${q.id}: missing tier in answer key`);
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
  }

  if (errors.length) {
    for (const e of errors) console.error(e);
    fail(`${errors.length} validation error(s)`);
  }
  console.log(`OK: ${worksheets}/${spine.topics.length} topics validated`);
}

main();
