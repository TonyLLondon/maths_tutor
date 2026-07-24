# Learn guides + glossary — content brief

Child-friendly **wiki-style** articles for the **lewis** tenant. Separate from per-question `support.json` (hints stay short; help can link here later).

## Paths (all under tenant maths)

| Kind | Path | Count |
|------|------|------:|
| **Domain hub** | `content/tenants/lewis/subjects/maths/learn/domains/{domain}.md` | **6** |
| **Topic guide** | `content/tenants/lewis/subjects/maths/learn/topics/{domain}/{CODE}.md` | **86** (every spine code) |
| **Glossary term** | `content/tenants/lewis/subjects/maths/learn/glossary/{slug}.md` | **53** (fixed list below) |

Domains: `number`, `algebra`, `ratio`, `geometry`, `probability`, `statistics`.

Spine codes: `src/lib/topics/spine.json`.

## Audience

Children roughly **7–14**. Plain English, short sentences, warm tone (“you”, “try”, “remember”).

**Never** in kid-facing copy: GCSE, Edexcel, AO, spine, markdown, tenant, JSON, file paths, “spec code” (codes OK in YAML only).

## Domain hub template (`domains/{domain}.md`)

```yaml
---
kind: domain
domain: number
title: Number
---
```

Body (markdown):

1. **What lives here** — 2–4 sentences, no jargon pile-up.
2. **You might already know** — 3–5 bullets (prior knowledge).
3. **Topics in this area** — bullet list: child-friendly name + `{CODE}` in backticks for parents only, or omit code in prose and use “Practice: Ordering numbers” style names from `spine.json` `title` simplified.
4. **How to use these guides** — one short paragraph: read before practice, use Help on a question for steps.

## Topic guide template (`topics/{domain}/{CODE}.md`)

Read `{CODE}.md` worksheet **Getting started** + first fluency section for level and vocabulary. Do **not** copy question stems or answers.

```yaml
---
kind: topic
domain: geometry
code: G15
title: Bearings and measuring angles
---
```

Required sections:

### What this is about
3–5 short paragraphs. What the child is learning and why it matters in real life.

### Words to know
5–10 bullets. Link glossary terms as markdown links: `[bearing](../glossary/bearing.md)` when a glossary page exists (see list below).

### Worked example 1
Full worked solution with **different numbers** from any single worksheet question. Show steps in plain language.

### Worked example 2
Second method or slightly harder case (optional but preferred for AO2-style topics).

### Tips for practice
3–5 bullets (common mistakes, what to draw, when to sketch).

Min length: ~400 words per topic guide; harder topics (G17, A22, S6) can be longer.

## Glossary template (`glossary/{slug}.md`)

```yaml
---
kind: glossary
slug: mean
title: Mean (average)
relatedTopics:
  - statistics/S4
  - statistics/S1
---
```

### In plain English
2–4 sentences definition a child can read aloud.

### Example
One short worked numeric or situational example (not copied from a specific question id).

### Watch out
1–3 bullets (confusions with similar words).

## Fixed glossary slugs (write every file exactly once)

`acute-angle`, `alternate-angles`, `area`, `bar-chart`, `bearing`, `bidmas`, `circumference`, `co-interior-angles`, `coordinates`, `corresponding-angles`, `decimal`, `diameter`, `equation`, `estimate`, `expression`, `factor`, `fair`, `formula`, `fraction`, `frequency`, `gradient`, `hcf`, `independent-events`, `lcm`, `line-graph`, `mean`, `median`, `mode`, `multiple`, `obtuse-angle`, `outcome`, `parallel-lines`, `percentage`, `perimeter`, `pie-chart`, `prime`, `probability`, `proportion`, `radius`, `random`, `range`, `ratio`, `right-angle`, `rounding`, `sample-space`, `scale-factor`, `scatter-graph`, `sequence`, `standard-form`, `substitute`, `tally`, `transversal`, `volume`

(53 files — slug must match filename without `.md`.)

## Rules

- **Hand-write** every file. No scripts, no bulk generators.
- Maths: `$...$` for inline; simple `##` headings only.
- **Do not** edit `{CODE}.support.json` or worksheets in this pass unless Tony asked (this pass is learn/ only).
- Peer read one existing guide in the same domain before writing the rest (match tone).

## Finish line

Report counts: domain hubs (6), topic guides (86 total across agents), glossary (53).

Optional check: `find content/tenants/lewis/subjects/maths/learn -name '*.md' | wc -l` → expect **145** files.

## Background agents

Model **`composer-2.5-fast`** only. Include **Execution (mandatory)** block from `AGENTS.md`.
