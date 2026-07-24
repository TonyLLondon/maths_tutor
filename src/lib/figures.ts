/** Explicit read-only diagrams — authored in `{CODE}.figures.json`, never inferred. */

export type FigureCategory = {
  label: string;
  value: number;
};

export type ScatterPoint = {
  x: number;
  y: number;
};

export type FigureTrendLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type FigureSpec =
  | { type: "tally"; label: string; count: number }
  | { type: "tallyMarks"; count: number }
  | { type: "barChart"; title?: string; categories: FigureCategory[] }
  | {
      type: "lineChart";
      title?: string;
      xLabel?: string;
      yLabel?: string;
      series: FigureCategory[];
    }
  | {
      type: "scatterGraph";
      title?: string;
      xLabel?: string;
      yLabel?: string;
      points: ScatterPoint[];
      trendLine?: FigureTrendLine;
      outlierIndex?: number;
      /** Side-by-side second panel (e.g. compare strong vs weak). */
      secondary?: {
        label?: string;
        xLabel?: string;
        yLabel?: string;
        points: ScatterPoint[];
        trendLine?: FigureTrendLine;
      };
    }
  | {
      type: "pictogram";
      symbol?: string;
      unitLabel?: string;
      count?: number;
      rows?: FigureCategory[];
    }
  | {
      type: "frequencyTable";
      columnLabels?: { category?: string; value?: string };
      rows: FigureCategory[];
    }
  | { type: "pieChart"; title?: string; sectors: FigureCategory[] }
  | {
      type: "angleDiagram";
      label?: string;
      /** Angle size in degrees (≤ 360). */
      degrees: number;
      rayLabels?: [string, string];
    }
  | {
      type: "coordinatePlot";
      title?: string;
      xLabel?: string;
      yLabel?: string;
      xMin?: number;
      xMax?: number;
      yMin?: number;
      yMax?: number;
      points: ScatterPoint[];
    }
  | {
      type: "bearingDiagram";
      label?: string;
      /** Clockwise from North, 0–360. */
      bearing: number;
      /** Second bearing from the same point (e.g. compare two directions). */
      bearing2?: number;
    }
  | {
      type: "netDiagram";
      label?: string;
      solid:
        | "cuboid"
        | "triangularPrism"
        | "squarePyramid"
        | "cone"
        | "cylinder";
      edgeCm?: number;
    }
  | {
      type: "circleDiagram";
      label?: string;
      radiusCm?: number;
      diameterCm?: number;
      /** Sector at the centre (degrees). Shaded when set. */
      sectorDegrees?: number;
    }
  | {
      type: "parallelLinesDiagram";
      label?: string;
      /** Marked angle on the standard parallel-lines + transversal layout. */
      markedAngle: number;
    };

export type QuestionFiguresFile = {
  version: 1;
  figures: Record<string, FigureSpec>;
};

export function isFigureSpec(value: unknown): value is FigureSpec {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const t = (value as { type: string }).type;
  if (t === "tally") {
    const v = value as { label?: unknown; count?: unknown };
    return typeof v.label === "string" && typeof v.count === "number";
  }
  if (t === "tallyMarks") {
    return typeof (value as { count?: unknown }).count === "number";
  }
  if (t === "barChart") {
    const v = value as { categories?: unknown };
    return Array.isArray(v.categories) && v.categories.every(isCategory);
  }
  if (t === "lineChart") {
    const v = value as { series?: unknown };
    return Array.isArray(v.series) && v.series.length >= 2 && v.series.every(isCategory);
  }
  if (t === "scatterGraph") {
    const v = value as { points?: unknown; secondary?: unknown };
    if (
      !Array.isArray(v.points) ||
      v.points.length < 2 ||
      !v.points.every(isScatterPoint)
    ) {
      return false;
    }
    if (v.secondary != null) {
      const s = v.secondary as { points?: unknown };
      if (
        !Array.isArray(s.points) ||
        s.points.length < 2 ||
        !s.points.every(isScatterPoint)
      ) {
        return false;
      }
    }
    return true;
  }
  if (t === "pictogram") {
    return true;
  }
  if (t === "frequencyTable") {
    const v = value as { rows?: unknown };
    return Array.isArray(v.rows) && v.rows.every(isCategory);
  }
  if (t === "pieChart") {
    const v = value as { sectors?: unknown };
    return (
      Array.isArray(v.sectors) &&
      v.sectors.length >= 2 &&
      v.sectors.every(isCategory)
    );
  }
  if (t === "angleDiagram") {
    const v = value as { degrees?: unknown };
    return typeof v.degrees === "number" && v.degrees > 0 && v.degrees <= 360;
  }
  if (t === "coordinatePlot") {
    const v = value as { points?: unknown };
    return (
      Array.isArray(v.points) &&
      v.points.length >= 1 &&
      v.points.every(isScatterPoint)
    );
  }
  if (t === "bearingDiagram") {
    const v = value as { bearing?: unknown; bearing2?: unknown };
    if (typeof v.bearing !== "number" || v.bearing < 0 || v.bearing > 360) {
      return false;
    }
    if (v.bearing2 != null) {
      const b2 = v.bearing2;
      if (typeof b2 !== "number" || b2 < 0 || b2 > 360) return false;
    }
    return true;
  }
  if (t === "netDiagram") {
    const solids = new Set([
      "cuboid",
      "triangularPrism",
      "squarePyramid",
      "cone",
      "cylinder",
    ]);
    return solids.has((value as { solid?: string }).solid ?? "");
  }
  if (t === "circleDiagram") {
    const v = value as {
      radiusCm?: unknown;
      diameterCm?: unknown;
      sectorDegrees?: unknown;
    };
    const r = v.radiusCm;
    const d = v.diameterCm;
    const hasSize =
      (typeof r === "number" && r > 0) ||
      (typeof d === "number" && d > 0) ||
      v.sectorDegrees != null;
    if (!hasSize) return false;
    if (
      v.sectorDegrees != null &&
      (typeof v.sectorDegrees !== "number" ||
        v.sectorDegrees <= 0 ||
        v.sectorDegrees > 360)
    ) {
      return false;
    }
    return true;
  }
  if (t === "parallelLinesDiagram") {
    const v = value as { markedAngle?: unknown };
    return (
      typeof v.markedAngle === "number" &&
      v.markedAngle > 0 &&
      v.markedAngle <= 360
    );
  }
  return false;
}

function isCategory(row: unknown): row is FigureCategory {
  return (
    !!row &&
    typeof row === "object" &&
    typeof (row as FigureCategory).label === "string" &&
    typeof (row as FigureCategory).value === "number"
  );
}

function isScatterPoint(p: unknown): p is ScatterPoint {
  return (
    !!p &&
    typeof p === "object" &&
    typeof (p as ScatterPoint).x === "number" &&
    typeof (p as ScatterPoint).y === "number"
  );
}
