# Product roadmap (ideas)

Kid-first maths + chess. Not committed work — pick items and move to `issues/` when starting.

**Out of scope for now:** parent-only tools (progress export, editor guardrails, hiding edit from children).

---

## Learning loop

| Idea | Notes |
|------|--------|
| **Daily mix (“Today’s 5”)** | One entry from Subjects: five Easier questions across the Archer path (or weak topics), reusing Practice grading — not “pick topic → tier” first. |
| **Weak-topic signal** | On Start here, surface “Try again” for topics with attempts but low correct rate on Medium/Harder; reorder or second row — no gamification jargon. |
| **Print ↔ Practice alignment** | In Practice, show “Worksheet question N” so paper and app IDs match (numbering already aligned in content). |

---

## Content quality

| Idea | Notes |
|------|--------|
| **Editorial pass — Archer path only** | Human review 17 × 30 questions: dedupe stems, trim any Higher-flavoured prompts, tighten `contains` keys. |
| **Stricter answer-key lint** | Extend `npm run content:validate`: empty `accept` on `text`, useless `contains`, bar-chart without `bars`, self-check on pure numeric fluency. |
| **Static “show me” visuals** | Read-only SVGs for stats/graphs/geometry (S1, S2, A8, G1…) — no marking yet; reduce “imagine this chart” friction. See also `issues/002-visuals-deferred.md`. |

---

## UX (children)

| Idea | Notes |
|------|--------|
| **Topic completion on Start here** | e.g. “Easier done” when tier 1 mostly correct; label Medium as “Go further” in hub copy where helpful. |
| **Subjects home balance** | Maths + chess on equal footing; optional “Continue” last topic (session cookie) on Subjects. |
| **Optional correct/wrong sounds** | Off by default; small delight, no new words on screen. |

---

## Visual / interactive answers (after static visuals)

| Idea | Notes |
|------|--------|
| **Grid-point answers** | Coordinate tap widget for A8-style questions; graded JSON, not freehand. |
| **More bar-chart items** | Migrate other “draw a bar chart” prompts beyond S1 Q19 where data is fixed. |

Documented kinds today: `issues/004-practice-answer-kinds.md`.

---

## Technical

| Idea | Notes |
|------|--------|
| **CI** | GitHub Action: `npm run content:validate` + `npm run build` on push. |
| **Leaner Practice payload** | Server sends `kind` + bar spec only; omit `accept` for self-check/bar (minor hardening). |
| **Progress schema version** | Version KV progress blob if question IDs or topics split/merge. |

---

## Later

| Idea | Notes |
|------|--------|
| **GCSE Higher spine** | Separate catalogue — do not add rows to the kid Start here list. |
| **Locale** | Only if a second child needs different copy; single tenant is fine for now. |

---

## Done (reference)

- Full Foundation worksheets 86/86, three Practice tiers, answer kinds (`text` / `self-check` / `bar-chart`), Archer path + collapsed full list, `content:validate`, canonical subjects/maths URLs.
