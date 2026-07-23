# G16 content vs Edexcel G16

**Status:** closed (geometry batch 2026-07-23 — G16 rewritten, G17 added)

## Problem

`geometry/G16.md` was written as **Volume (intro)**. On Edexcel 1MA1 Foundation, **G16** is:

> Know and apply formulae to calculate area of triangles, parallelograms, trapezia; volume of cuboids and other right prisms (including cylinders).

**G17** is circumference/area of circles and composite areas/volumes.

The app catalogue title for G16 must match the spine (`Area of triangles and parallelograms`), not a generic volume-only sheet mis-labelled as G16.

## Fix (agent)

1. Rewrite `geometry/G16.md` + `.answers.json` for **spec G16** (areas + right-prism volume as per statement).
2. Add **`geometry/G17.md`** (+ answers) for circles / composite area-volume using suitable age-9 depth.
3. Salvage strong “counting unit cubes” items from the old G16 into G17 or tier-1 G16 prism questions where they fit the spec.

## Acceptance

- Frontmatter `topic: G16` / `G17` matches files.
- 30 questions each, three tiers via section headings + `"tier"` in JSON.
- `python3 _backlog/scripts/update-coverage.py` shows both present.
