# Product backlog (maths tutor)

Planning, agent runs, and coverage tracking live here — not in kid-facing UI.

## Layout

| Path | Purpose |
|------|---------|
| `state/gcse-foundation-spine.json` | **Source of truth:** all Edexcel 1MA1 **Foundation** content codes (86 topics) with domain + title |
| `state/coverage.json` | Generated snapshot: which slugs have `.md` / `.answers.json`, question counts, missing list |
| `agents/` | One markdown brief per agent batch (what to write, tier rules, done criteria) |
| `logs/` | Append-only run notes (`YYYY-MM-DD-<batch>.md`) |
| `issues/` | Decisions and remaps that block or skew coverage |
| `ROADMAP.md` | Prioritised product ideas (not yet scheduled) |

## Regenerate coverage

From repo root:

```bash
python3 _backlog/scripts/update-coverage.py
npm run content:validate
```

Content maintenance scripts (repo root):

- `scripts/migrate-answer-kinds.py` — legacy `any:true` → `self-check`
- `scripts/backfill-answer-tiers.py` — set `tier` on every answer from section headings

## Question tiers (Practice)

Three fixed tiers per topic (not adaptive):

| Tier | Kid label | Content |
|------|-----------|---------|
| 1 | **Easier** | Fluency / More fluency sections |
| 2 | **Medium** | Reasoning / Mixed practice |
| 3 | **Harder** | Problem / Stretch |

New worksheets must use those section headings. Answer keys should include `"tier": 1|2|3` per question; Practice falls back to section names when `tier` is omitted.

## Agent workflow

1. Run `python3 _backlog/scripts/update-coverage.py` → use `missingSlugs` only (do **not** reuse stale `batch-*.txt` after spine is full).
2. Read `_backlog/agents/WORKSHEET-BRIEF.md`.
3. Write under `content/tenants/archer/subjects/maths/topics/…`
4. Log in `logs/` and re-run coverage.

See `_backlog/issues/003-parallel-batch-overlap.md` if multiple agents touch the same slug.

## Scope

- **Full Foundation code coverage** (86 topics) — manageable, finite list in `gcse-foundation-spine.json`.
- **Visual / drawn answers:** partial (`004`); richer visuals in `ROADMAP.md` and `issues/002-visuals-deferred.md`.
- **Next ideas:** see [`ROADMAP.md`](ROADMAP.md) (no parent-only tools in that list yet).
