# Figures wave 3 — geometry coverage + quality audit

Tenant: **`lewis`**. Path: `content/tenants/lewis/subjects/maths/topics/{domain}/`.

Types added in `src/lib/figures.ts`: **`bearingDiagram`**, **`netDiagram`**, **`circleDiagram`**, **`parallelLinesDiagram`**. See `_backlog/agents/FIGURES-BRIEF.md`.

## Rules

- Hand-edit `{CODE}.md`, `{CODE}.figures.json`, light touch `{CODE}.support.json` only when hint/help quoted removed prose.
- Do **not** change `answers.json` unless stem change breaks accept strings.
- **`angleDiagram`** = generic angle / protractor / elevation wedge — **not** bearings or parallel-line transversal layouts.
- **`bearingDiagram`** = clockwise from **North** (three-digit labels in figure, e.g. 075°).
- **`parallelLinesDiagram`** = two parallel lines + transversal; `markedAngle` matches the angle named in the stem.
- **`netDiagram`** = pick `solid` that matches the stem (cuboid, triangularPrism, squarePyramid, cone, cylinder).
- **`circleDiagram`** = radius/diameter line and optional `sectorDegrees` for arc/sector questions.
- Remove **`coordinatePlot`** from ids where the stem is definition, true/false, or no grid read-off (G11/G7 audit).
- Stems: refer to “the diagram”, “the net”, “the circle diagram” — remove duplicated numbers now in JSON.

## Finish

`CONTENT_TENANT=lewis npm run content:validate` — report per-code figure counts and types.
