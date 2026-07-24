# Read-only figures in practice (show, don’t build)

**Status:** platform types complete; wave 3 content pass in progress

Kids see charts/tables/diagrams from **`{CODE}.figures.json`** via `FigureView`. No NLP inference.

## Figure types (platform)

tally, tallyMarks, barChart, lineChart, scatterGraph, pieChart, pictogram, frequencyTable, angleDiagram, **bearingDiagram**, **netDiagram**, **circleDiagram**, **parallelLinesDiagram**, coordinatePlot.

## What’s in good shape

- **Statistics (S1, S2, S4, S6)** and **probability (P1–P8):** data-heavy stems largely covered.
- **Algebra:** tables/coordinate plots where authored.
- **Geometry G1–G16 partial:** angles, coordinates, some tables.

## Wave 3 targets

| Area | Work |
|------|------|
| **G15 bearings** | `bearingDiagram` on numeric bearing stems; keep `angleDiagram` for protractor/elevation only |
| **G12 nets** | `netDiagram` on net/solid stems |
| **G17, G18** | new `figures.json` with `circleDiagram` |
| **G3 (G6)** | `parallelLinesDiagram` for transversal stems; drop wrong `angleDiagram` |
| **G11, G7, G24, G25** | remove spurious `coordinatePlot` |
| **S1, S2, S4** | pie/line vs table mismatches |

## Out of scope

Interactive answer graphing — `issues/006-interactive-bar-chart-answers.md`.
