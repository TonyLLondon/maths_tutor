# 2026-07-23 — Foundation coverage kickoff

- Added `_backlog/` with spine (86 Foundation codes), coverage snapshot (17/86 worksheets), issues, agent briefs.
- Maths catalogue now lists **all** spine topics; UI shows `ready/total` per domain.
- Practice: **Easier / Medium / Harder** tabs (tier from section headings).
- Launched background agents for missing slugs (see `agents/`).

Target: **86/86** worksheets × 30 questions × tier-tagged answer keys.

- **Geometry batch** (`_backlog/agents/batch-geometry.txt`): added G6, G7, G9, G11, G12, G13, G15, G17, G18, G19, G20, G21, G24, G25 (30 Q + tier-tagged answers each); added missing `G5.answers.json`; rewrote `G16.md`/`G16.answers.json` per issue 001 (area of triangles/parallelograms/trapezia + cuboid/prism/cylinder volume, salvaging unit-cube volume items into G16 tier 1); `G2`/`G3`/`G4` were already spec-correct and left untouched. `update-coverage.py` now reports **86/86** worksheets, 0 missing, 0 partial.

- `probability` batch: added P2–P8 (Expected outcomes, Relative frequency and probability, Exhaustive and mutually exclusive events, Sample size and probability, Systematic enumeration, Possibility spaces, Combined events). `statistics` batch: added S2, S5, S6 (Tables and charts, Describe a population, Scatter graphs). Each is 30 questions with a tier-tagged answer key. `update-coverage.py` now reports **86/86** worksheets.

## 2026-07-23 — Complete

- Final chase: geometry G18–G21, G24–G25 + ratio/R16 + statistics/S5, S6 → **86/86** worksheets, 0 partial (`update-coverage.py`).

- `batch-algebra_a` agent: added `algebra/A2` (Substitution), `A3` (Expressions, equations and identities), `A4` (Simplify and expand), `A5` (Formulae and rearranging), `A6` (Equations vs identities), `A7` (Functions as inputs and outputs), `A9` (Straight-line graphs), `A10` (Gradient and intercept), `A11` (Quadratic graphs), `A12` (Graph families), `A14` (Real-context graphs) — 11 worksheets, 30 questions each, tier-tagged answer keys. Ran `update-coverage.py`: **86/86** worksheets now present (0 missing, 0 partial).

## batch-number.txt agent — 2026-07-23

- Created 8 missing number worksheets (30 Qs + tier-tagged answers each): N6 (Powers and roots), N7 (Roots and indices), N8 (Exact calculation with fractions and π), N9 (Standard form), N11 (Fractions in ratio problems), N13 (Standard units and compound measures), N15 (Rounding and error intervals), N16 (Limits of accuracy). Skipped N2 and N5 (already existed).
- Ran `update-coverage.py`: **worksheets 80/86, missing 6, partial 0**.

- **algebra_a batch**: added A2, A3, A4, A5, A6, A7, A9, A10, A11, A12, A14 (11 worksheets, 30 questions each, tier-tagged answer keys). Coverage now **72/86**, 0 partial.

## Batch: number (10 topics)

- Added worksheets + answer keys for all 10 slugs in `agents/batch-number.txt`: N2, N5, N6, N7, N8, N9, N11, N13, N15, N16.
- Each has 30 numbered questions (Fluency/More fluency → tier 1, Reasoning/Mixed → tier 2, Problem/Stretch → tier 3), every answer id 1–30 present with a `tier` on every entry.
- Ran `update-coverage.py`: **61/86** worksheets, 0 partial (under 30 questions).

- `batch-algebra_b`: added A17, A18, A19, A21, A22, A24, A25 (7 worksheets, 30 Qs + tier-tagged answers each) → coverage now 45/86.
- `batch-algebra_b` follow-up: A17, A18, A19, A21 already existed; created the remaining missing slugs — A22 (Linear inequalities), A24 (Special sequences), A25 (nth term of linear sequences) — 30 Qs + tier-tagged answers each → coverage now 60/86.

## batch-ratio.txt agent — 2026-07-23

- Created 13 missing ratio worksheets (30 Qs + tier-tagged answers each): R2 (Scale factors and maps), R3 (Fraction of one quantity to another), R4 (Ratio notation), R6 (Ratio or fraction for a multiplicative relationship), R7 (Proportion as equality of ratios), R8 (Ratios, fractions and linear functions), R9 (Percentages), R10 (Direct and inverse proportion), R11 (Compound units), R12 (Ratio with length, area and volume), R13 (Inverse proportion equations), R14 (Gradient as rate of change), R16 (Growth and decay).
- Note: `R16` is listed in three agent batch files (`batch-ratio.txt`, `batch-remaining.txt`, `batch-final-misc.txt`); a concurrent write collision duplicated its content mid-run — fixed by rewriting both `R16.md` and `R16.answers.json` cleanly. Worth de-duplicating those batch lists to avoid repeat collisions on R10–R14 (also listed in `batch-remaining.txt`).
- Ran `update-coverage.py`: **worksheets 84/86, missing 2, partial 0**.
- `batch-final-geometry`: G15 already existed; created G18, G19, G20, G21, G24 and G25 with 30 questions and complete tier-tagged answers. Coverage now **86/86**, 0 partial.
- `batch-final-misc`: completed R16, S5 and S6 with 30 questions and tier-tagged answer keys; ran `update-coverage.py` → **86/86 worksheets, 0 missing, 0 partial**.

## batch-prob_stat.txt agent — 2026-07-23

- Created 10 worksheets (30 Qs + tier-tagged answers each): P2 (Expected outcomes), P3 (Relative frequency and probability), P4 (Exhaustive and mutually exclusive), P5 (Sample size and probability), P6 (Systematic enumeration), P7 (Possibility spaces), P8 (Combined events), S2 (Tables and charts), S5 (Describe a population), S6 (Scatter graphs).
- `S2`, `S5`, `S6`, and `P8` are also listed in `batch-remaining.txt` (and `S5`/`S6` in `batch-final-misc.txt`); concurrent writes from other agents overwrote `S5.md`/`S5.answers.json` and `S6.md`/`S6.answers.json` mid-run (same corruption pattern as the earlier `R16` collision). Rewrote both files cleanly and re-verified (30/30 questions, valid JSON, every id 1–30 tier-tagged) immediately before finishing.
- Ran `update-coverage.py`: **worksheets 86/86, missing 0, partial 0**.

## batch-ratio.txt agent — second pass — 2026-07-23

- A separate concurrent run of this same `batch-ratio.txt` list (logged above) landed while this pass was mid-flight. This pass independently wrote fresh 30-question worksheets + tier-tagged answer keys for all 13 slugs (R2, R3, R4, R6, R7, R8, R9, R10, R11, R12, R13, R14, R16); these files are the ones now on disk (verified: every `.md` has questions 1–30 continuous, every `.answers.json` has ids 1–30 each with a `tier`, all JSON parses cleanly).
- Ran `update-coverage.py` after writing: **worksheets 86/86, missing 0, partial 0** (unchanged — coverage was already complete from other parallel batches).

## batch-geometry.txt agent — G16/G17 spec alignment — 2026-07-23

- Followed `_backlog/issues/001-g16-spec-alignment.md`: rewrote `geometry/G16.md` + `.answers.json` for the correct spec statement (area of triangles, parallelograms, trapezia; volume of cuboids/prisms/cylinders), salvaging the strongest unit-cube-counting fluency items from the old volume-only sheet into G16's new Fluency section. Added `geometry/G17.md` + `.answers.json` for circumference and area of circles.
- Wrote fresh 30-question worksheets + tier-tagged answer keys for every slug in `agents/batch-geometry.txt`: G2 (Constructions and loci), G3 (Angle facts), G4 (Quadrilateral and triangle properties), G5 (Triangle congruence), G6 (Angle and side reasoning), G7 (Congruence and similarity transformations), G9 (Circle definitions), G11 (Problems on coordinate axes), G12 (3D shape properties), G13 (Plans and elevations), G15 (Measuring segments and angles), G17, G18 (Arcs and sectors), G19 (Similarity and lengths), G20 (Pythagoras and trigonometry), G21 (Exact trig values), G24 (Translation vectors), G25 (Vector arithmetic) — 19 worksheets total including the G16 rewrite.
- Verified every `.md` has continuous questions 1–30, every `.answers.json` has ids 1–30 each with a `tier` matching its section, all JSON parses cleanly, and all numeric answers hand-checked.
- Ran `update-coverage.py`: **worksheets 86/86, missing 0, partial 0**.

## batch-remaining.txt agent — final chase — 2026-07-23

- Of the 20 slugs in `agents/batch-remaining.txt`, `ratio/R10` and `geometry/G12` already had worksheets + answers on disk and were skipped per the brief. Created fresh 30-question worksheets + tier-tagged answer keys for the remaining 18: `algebra/A14` (Real-context graphs), `ratio/R11` (Compound units), `ratio/R12` (Ratio with length, area and volume), `ratio/R13` (Inverse proportion equations), `ratio/R14` (Gradient as rate of change), `ratio/R16` (Growth and decay), `geometry/G13` (Plans and elevations), `geometry/G15` (Measuring segments and angles), `geometry/G18` (Arcs and sectors), `geometry/G19` (Similarity and lengths), `geometry/G20` (Pythagoras and trigonometry), `geometry/G21` (Exact trig values), `geometry/G24` (Translation vectors), `geometry/G25` (Vector arithmetic), `probability/P8` (Combined events), `statistics/S2` (Tables and charts), `statistics/S5` (Describe a population), `statistics/S6` (Scatter graphs).
- Every `.md` has continuous questions 1–30 across Fluency/Reasoning/Problem/Stretch sections; every `.answers.json` has ids 1–30, each with a `tier` matching its section, and all numeric answers hand-checked (e.g. arc/sector formulae, Pythagoras/trig triples, exact trig values, vector arithmetic, compound interest multipliers, pie chart angles).
- Ran `update-coverage.py`: **worksheets 86/86, missing 0, partial 0**.
