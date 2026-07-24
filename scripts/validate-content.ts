/**
 * Validates maths topic worksheets and answer keys.
 * Run: npm run content:validate
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  parseQuestions,
  ratingRangeForSection,
  resolveAnswerKind,
  type AnswerEntry,
} from "../src/lib/questions.ts";
import { TARGET_QUESTIONS_PER_TOPIC } from "../src/lib/practice-rating.ts";
import { isFigureSpec } from "../src/lib/figures.ts";

const ROOT = path.join(import.meta.dirname, "..");
const CONTENT_TENANT = process.env.CONTENT_TENANT ?? "lewis";
const TOPICS = path.join(
  ROOT,
  "content/tenants",
  CONTENT_TENANT,
  "subjects/maths/topics",
);
const LEARN = path.join(
  ROOT,
  "content/tenants",
  CONTENT_TENANT,
  "subjects/maths/learn",
);
const SPINE = path.join(ROOT, "src/lib/topics/spine.json");

const FORBIDDEN_HELP_PHRASE = "Picture what is happening";

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
    const learnGuidePath = path.join(
      LEARN,
      "topics",
      t.domain,
      `${t.code}.md`,
    );
    if (!fs.existsSync(learnGuidePath)) {
      errors.push(`missing learn guide ${t.domain}/${t.code} (learn/topics/...)`);
    }
    const learnMetaPath = path.join(TOPICS, t.domain, `${t.code}.learn.json`);
    if (fs.existsSync(learnMetaPath)) {
      const meta = JSON.parse(fs.readFileSync(learnMetaPath, "utf8")) as {
        version?: unknown;
        glossaryTerms?: unknown;
      };
      if (meta.version !== 1) {
        errors.push(`${t.domain}/${t.code}.learn.json: version must be 1`);
      }
      if (meta.glossaryTerms != null) {
        if (!Array.isArray(meta.glossaryTerms)) {
          errors.push(`${t.domain}/${t.code}.learn.json: glossaryTerms must be array`);
        } else {
          for (const slug of meta.glossaryTerms) {
            if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
              errors.push(`${t.domain}/${t.code}.learn.json: invalid slug ${slug}`);
            } else if (
              !fs.existsSync(path.join(LEARN, "glossary", `${slug}.md`))
            ) {
              errors.push(
                `${t.domain}/${t.code}.learn.json: unknown glossary slug ${slug}`,
              );
            }
          }
        }
      }
    }
    const topicLearnLink = `mtlearn:${t.domain}/${t.code}`;
    const support = JSON.parse(fs.readFileSync(supportPath, "utf8")) as {
      questions: Record<string, { hint?: string; help?: string }>;
    };
    const ids = questions.map((q) => q.id);
    const qSet = new Set(ids);
    const aSet = new Set(Object.keys(key.answers));

    if (questions.length < TARGET_QUESTIONS_PER_TOPIC) {
      errors.push(
        `${t.domain}/${t.code}: need ${TARGET_QUESTIONS_PER_TOPIC} questions for adaptive practice, got ${questions.length}`,
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
      } else {
        if (!sup.help.includes(topicLearnLink)) {
          errors.push(
            `${t.domain}/${t.code} Q${id}: help must link topic guide (${topicLearnLink})`,
          );
        }
        if (sup.help.includes(FORBIDDEN_HELP_PHRASE)) {
          errors.push(
            `${t.domain}/${t.code} Q${id}: help uses forbidden filler phrase`,
          );
        }
        if (sup.help.trim().length > 1400) {
          errors.push(
            `${t.domain}/${t.code} Q${id}: help too long (${sup.help.trim().length} chars, max 1400)`,
          );
        }
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
    if (!fs.existsSync(learnMetaPath)) {
      errors.push(`missing ${t.domain}/${t.code}.learn.json (glossaryTerms for practice links)`);
    }
    const figuresPath = path.join(TOPICS, t.domain, `${t.code}.figures.json`);
    if (fs.existsSync(figuresPath)) {
      const figuresRaw = JSON.parse(fs.readFileSync(figuresPath, "utf8")) as {
        version?: unknown;
        figures?: unknown;
      };
      if (figuresRaw.version !== 1) {
        errors.push(
          `${t.domain}/${t.code}.figures.json: version must be 1`,
        );
      }
      const figMap = figuresRaw.figures;
      if (!figMap || typeof figMap !== "object") {
        errors.push(`${t.domain}/${t.code}.figures.json: missing figures object`);
      } else {
        for (const fid of Object.keys(figMap as Record<string, unknown>)) {
          if (!qSet.has(fid)) {
            errors.push(`${t.domain}/${t.code}: orphan figure id ${fid}`);
          }
          if (!isFigureSpec((figMap as Record<string, unknown>)[fid])) {
            errors.push(`${t.domain}/${t.code} Q${fid}: invalid figure spec`);
          }
        }
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
      } else {
        const band = ratingRangeForSection(q.section);
        if (rating < band.min || rating > band.max) {
          errors.push(
            `${t.domain}/${t.code} Q${q.id}: rating ${rating} outside section band ${band.min}–${band.max} (${q.section})`,
          );
        }
      }
      if (entry.any) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: legacy any:true — run migrate-answer-kinds.py`,
        );
      }
      if (entry.kind === "self-check") {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: self-check removed — use typed accept or contains grading`,
        );
      }
      const kind = resolveAnswerKind(entry);
      if (kind === "bar-chart" && !entry.bars) {
        errors.push(`${t.domain}/${t.code} Q${q.id}: bar-chart missing bars`);
      }
      if (kind !== "bar-chart" && (!entry.accept || entry.accept.length === 0)) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: empty accept — add accept strings or contains keywords`,
        );
      }
      if (entry.contains && (!entry.accept || entry.accept.length === 0)) {
        errors.push(
          `${t.domain}/${t.code} Q${q.id}: contains grading needs accept keywords`,
        );
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
