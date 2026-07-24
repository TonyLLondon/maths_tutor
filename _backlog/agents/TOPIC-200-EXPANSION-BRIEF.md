# Expand every spine topic to 200 questions

Target: **`TARGET_QUESTIONS_PER_TOPIC = 200`** in `src/lib/practice-rating.ts`. Validator enforces this for all 86 codes.

## Per topic files (same folder)

| File | Purpose |
|------|---------|
| `{CODE}.md` | Numbered questions `1.` … `200.` continuous |
| `{CODE}.answers.json` | `version: 1`, `answers` with `display`, `accept`, optional `contains` / `containsMin`, integer **`rating` 500–2000** |
| `{CODE}.support.json` | `hint` + `help` per id (see `QUESTION-SUPPORT-BRIEF.md`) |

Path: `content/tenants/lewis/subjects/maths/topics/{domain}/`

## Worksheet structure

- Keep YAML frontmatter (`title`, `topic`, `domain`, `ao`).
- Start with **`## Getting started`** (easy, age ~7) — ratings roughly **500–780**.
- Then GCSE-style sections (Fluency, Reasoning, Problem, Stretch, **More practice** as needed) spanning to **1900–2000** on hardest items.
- **Do not remove** good existing questions 1…n; **append** new ones and renumber to **1…200** if needed.
- Kid-readable stems; `$...$` for maths.

## Ratings ladder (per topic)

- **Lowest** question rating **≤ 650**; **highest ≥ 1900** (stretch at **2000** where appropriate).
- Spread **~200 distinct ratings** across 500–2000 so adaptive pick at any level has nearby questions.
- Assign ratings in `{CODE}.answers.json` when writing — **hand-set**, not identical bands copied from scripts.

## Answers

- Typed grading only (no self-mark UI). Multi-clue `contains` needs **2+** keyword hits when several accept strings.
- `kind: "bar-chart"` only where the worksheet expects a chart; include `bars`.

## Rules

- **Hand-write** every new question, answer, hint, and help in `{CODE}.md`, `{CODE}.answers.json`, and `{CODE}.support.json`.
- **Forbidden:** any Python/Node/shell script to generate, merge, or bulk-patch content (no merge tools, no draft generators, no chunk JSON to apply later).
- After your domain’s topics are done, run `npm run content:validate` and fix **all** errors mentioning your `{domain}/{CODE}`.
- Read `AGENTS.md` and `_backlog/agents/QUESTION-SUPPORT-BRIEF.md`.

## Domain topic lists (spine)

- **number:** N1–N16
- **algebra:** A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A14, A17, A18, A19, A21, A22, A23, A24, A25
- **ratio:** R1–R14, R16 (no R15)
- **geometry:** G1, G2, G3, G4, G5, G6, G7, G9, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G24, G25
- **probability:** P1–P8
- **statistics:** S1, S2, S4, S5, S6

Return: table of codes with final question count, validate result for your domain.
