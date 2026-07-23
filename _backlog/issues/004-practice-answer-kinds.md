# Practice answer kinds

**Status:** implemented (2026-07-23)

## Kinds

| `kind` | Practice UI | Grading |
|--------|-------------|---------|
| `text` | Textarea | `accept` / `contains` |
| `self-check` | Show answer → I got it right / Not yet | Honest self-mark |
| `bar-chart` | Height inputs per label | Exact match to `bars.heights` |

Legacy `"any": true` migrated to `self-check` via `scripts/migrate-answer-kinds.py`.

## Validation

`npm run content:validate` — 28–36 questions, continuous ids, matching answer keys, no legacy `any`.

## Next visuals

`grid-points` for A8 coordinate plotting; static SVG in markdown for read-only charts.
