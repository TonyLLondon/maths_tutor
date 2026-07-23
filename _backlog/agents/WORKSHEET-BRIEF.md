# Worksheet agent brief (shared)

Repo: `/Users/tonylewis/Documents/Projects/maths_tutor`

Read `_backlog/state/gcse-foundation-spine.json` for official **title** and **domain** per code.

## Deliverables per slug `{domain}/{CODE}`

1. `content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.md`
2. `content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.answers.json`

## Worksheet rules

- YAML frontmatter: `title`, `topic: CODE`, `domain`, `ao: [AO1, AO2, AO3]`, optional `week`, `printNotes`
- **30 questions**, numbered **1..30** continuously
- Sections (exact headings — they drive Practice tiers):
  - `## Fluency (AO1)` → tier 1
  - `## More fluency` → tier 1
  - `## Reasoning (AO2)` → tier 2
  - `## Mixed practice` → tier 2
  - `## Problem (AO3)` → tier 3
  - `## Stretch` → tier 3
- UK English, age **9**, Archer/Sloan sparingly, London contexts where natural
- Footer: `---` then `*GCSE link: …*`
- Match **Edexcel 1MA1 Foundation** statement for that code (see spine title)

## Answer key rules

```json
{ "version": 1, "answers": { "1": { "display": "…", "accept": ["…"], "tier": 1 } } }
```

- Every question id **1..30** present
- `"tier": 1|2|3` on **every** entry (align with section)
- Use `"contains": true` for open reasoning; see `src/lib/questions.ts`
- Hand-check numeric answers

## Special

- `_backlog/issues/001-g16-spec-alignment.md` — follow when touching G16/G17

## Done

- Run `python3 _backlog/scripts/update-coverage.py`
- Append one line to `_backlog/logs/2026-07-23-foundation-coverage-kickoff.md`
- **Do not git commit**
