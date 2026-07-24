# Explicit figures — content brief

Practice renders read-only diagrams from **`{CODE}.figures.json`**, not from question text. Types live in `src/lib/figures.ts`; UI is `FigureView`.

## When to add a figure

Add an entry when the learner needs to **see** a tally, bar chart, pictogram, frequency table, or similar **read-only** display. Do **not** describe the diagram in the stem (“a bar chart shows…”, “imagine…”, inline `|||` tallies).

**Interactive** bar-chart answers (`kind: "bar-chart"` in `answers.json`) stay separate — the child draws bars; use `figures.json` only for given data they read.

## File shape

Path: `content/tenants/lewis/subjects/maths/topics/{domain}/{CODE}.figures.json`

```json
{
  "version": 1,
  "figures": {
    "12": {
      "type": "barChart",
      "title": "Favourite fruit",
      "categories": [
        { "label": "apple", "value": 4 },
        { "label": "banana", "value": 7 }
      ]
    }
  }
}
```

Question ids are strings `"1"` … `"200"`. Only include ids that need a figure.

## Spec types

| `type` | Fields |
|--------|--------|
| `tally` | `label`, `count` (number of marks) |
| `tallyMarks` | `count` |
| `barChart` | optional `title`, `categories`: `{ label, value }[]` |
| `lineChart` | optional `title`, `xLabel`, `yLabel`, `series`: `{ label, value }[]` (≥2) — time series / joined points |
| `scatterGraph` | optional `title`, `xLabel`, `yLabel`, `points`: `{ x, y }[]`, optional `trendLine`, `outlierIndex`, `secondary` panel |
| `pieChart` | optional `title`, `sectors`: `{ label, value }[]` (≥2) — values are frequencies/counts |
| `angleDiagram` | optional `label`, `degrees` (1–360), optional `rayLabels`: `[string, string]` |
| `bearingDiagram` | optional `label`, `bearing` (0–360 clockwise from North), optional `bearing2` for two directions from same point |
| `netDiagram` | optional `label`, `solid`: `cuboid` \| `triangularPrism` \| `squarePyramid` \| `cone` \| `cylinder`, optional `edgeCm` |
| `circleDiagram` | optional `label`, optional `radiusCm` / `diameterCm`, optional `sectorDegrees` (shaded sector at centre) |
| `parallelLinesDiagram` | optional `label`, `markedAngle` (1–360) — two parallel lines cut by a transversal |
| `coordinatePlot` | optional axis bounds, `points`: `{ x, y }[]` — grid with plotted points |
| `pictogram` | optional `symbol`, `unitLabel`, `count` **or** `rows`: `{ label, value }[]` |
| `frequencyTable` | `rows`: `{ label, value }[]` |

## Stem edits

- Keep the maths question short; refer to “the chart”, “the table”, “the pictogram” when a figure is shown.
- Remove duplicated data from markdown that now lives in the figure.
- Do **not** change `answers.json` grading unless the stem change breaks accept strings (then fix accept by hand).
- Hints/help in `support.json` may need a light touch if they quoted old prose.

## Rules

- Hand-edit only. No scripts, no bulk merge tools.
- Run `CONTENT_TENANT=lewis npm run content:validate` when done.
- Optional file: topics with no visuals omit `figures.json`.

## Reference

- `AGENTS.md` — tenant path, validate, anti-lazy agent dispatch.
- Platform: `getQuestionFigures` in `src/lib/content.ts`, wired on practice page.
