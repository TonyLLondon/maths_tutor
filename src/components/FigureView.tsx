import type { FigureSpec } from "@/lib/figures";

type Props = {
  spec: FigureSpec;
};

function TallyMarks({ count }: { count: number }) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2"
      aria-label={`${count} tally marks`}
    >
      {Array.from({ length: count }, (_, i) => {
        const inGroup = i % 5;
        const isFifth = inGroup === 4;
        return (
          <span
            key={i}
            className="relative inline-block h-6 w-0.5 bg-stone-800"
            style={
              isFifth
                ? {
                    transform: "rotate(-25deg)",
                    marginLeft: -2,
                    marginRight: 2,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function BarChartDisplay({
  title,
  categories,
}: {
  title?: string;
  categories: { label: string; value: number }[];
}) {
  const max = Math.max(...categories.map((x) => x.value), 1);
  const scaleMax = Math.ceil(max * 1.15);
  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      {title ? (
        <figcaption className="mb-3 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <div className="flex items-end justify-center gap-4" style={{ minHeight: 120 }}>
        {categories.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium tabular-nums text-stone-700">
              {value}
            </span>
            <div
              className="w-10 rounded-t bg-sky-500"
              style={{
                height: `${Math.max(8, (value / scaleMax) * 96)}px`,
              }}
              role="img"
              aria-label={`${label} ${value}`}
            />
            <span className="max-w-[4.5rem] text-center text-xs capitalize text-stone-600">
              {label}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

const CHART_W = 320;
const CHART_H = 200;
const PAD = { l: 44, r: 12, t: 16, b: 36 };

function LineChartDisplay({
  title,
  xLabel,
  yLabel,
  series,
}: {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  series: { label: string; value: number }[];
}) {
  const vals = series.map((s) => s.value);
  const yMin = 0;
  const yMax = Math.ceil(Math.max(...vals, 1) * 1.12);
  const plotW = CHART_W - PAD.l - PAD.r;
  const plotH = CHART_H - PAD.t - PAD.b;
  const n = series.length;
  const toX = (i: number) => PAD.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const toY = (v: number) => PAD.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const path = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(s.value)}`)
    .join(" ");

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-3 py-3">
      {title ? (
        <figcaption className="mb-2 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="mx-auto w-full max-w-md"
        role="img"
        aria-label={title ?? "Line chart"}
      >
        <line
          x1={PAD.l}
          y1={PAD.t + plotH}
          x2={PAD.l + plotW}
          y2={PAD.t + plotH}
          stroke="#d6d3d1"
          strokeWidth={1}
        />
        <line
          x1={PAD.l}
          y1={PAD.t}
          x2={PAD.l}
          y2={PAD.t + plotH}
          stroke="#d6d3d1"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke="#0284c7" strokeWidth={2} />
        {series.map((s, i) => (
          <g key={s.label}>
            <circle cx={toX(i)} cy={toY(s.value)} r={4} fill="#0284c7" />
            <text
              x={toX(i)}
              y={PAD.t + plotH + 14}
              textAnchor="middle"
              className="fill-stone-600 text-[9px]"
            >
              {s.label}
            </text>
          </g>
        ))}
        {yLabel ? (
          <text
            x={8}
            y={PAD.t + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90 8 ${PAD.t + plotH / 2})`}
            className="fill-stone-500 text-[9px]"
          >
            {yLabel}
          </text>
        ) : null}
        {xLabel ? (
          <text
            x={PAD.l + plotW / 2}
            y={CHART_H - 4}
            textAnchor="middle"
            className="fill-stone-500 text-[9px]"
          >
            {xLabel}
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

function ScatterGraphDisplay({
  title,
  xLabel,
  yLabel,
  points,
  trendLine,
  outlierIndex,
  secondary,
}: {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  points: { x: number; y: number }[];
  trendLine?: { x1: number; y1: number; x2: number; y2: number };
  outlierIndex?: number;
  secondary?: {
    label?: string;
    xLabel?: string;
    yLabel?: string;
    points: { x: number; y: number }[];
    trendLine?: { x1: number; y1: number; x2: number; y2: number };
  };
}) {
  const panel = (
    panelTitle: string | undefined,
    pts: { x: number; y: number }[],
    line: typeof trendLine,
    outIdx: number | undefined,
    xL: string | undefined,
    yL: string | undefined,
  ) => {
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    let xMin = Math.min(...xs);
    let xMax = Math.max(...xs);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);
    if (line) {
      xMin = Math.min(xMin, line.x1, line.x2);
      xMax = Math.max(xMax, line.x1, line.x2);
      yMin = Math.min(yMin, line.y1, line.y2);
      yMax = Math.max(yMax, line.y1, line.y2);
    }
    const xPad = (xMax - xMin || 1) * 0.08;
    const yPad = (yMax - yMin || 1) * 0.08;
    xMin -= xPad;
    xMax += xPad;
    yMin -= yPad;
    yMax += yPad;
    const plotW = CHART_W - PAD.l - PAD.r;
    const plotH = CHART_H - PAD.t - PAD.b;
    const toX = (x: number) => PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    return (
      <div className="min-w-0 flex-1">
        {panelTitle ? (
          <p className="mb-1 text-center text-xs font-medium text-stone-700">
            {panelTitle}
          </p>
        ) : null}
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="mx-auto w-full"
          role="img"
          aria-label={panelTitle ?? "Scatter graph"}
        >
          <line
            x1={PAD.l}
            y1={PAD.t + plotH}
            x2={PAD.l + plotW}
            y2={PAD.t + plotH}
            stroke="#d6d3d1"
            strokeWidth={1}
          />
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={PAD.t + plotH}
            stroke="#d6d3d1"
            strokeWidth={1}
          />
          {line ? (
            <line
              x1={toX(line.x1)}
              y1={toY(line.y1)}
              x2={toX(line.x2)}
              y2={toY(line.y2)}
              stroke="#78716c"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          ) : null}
          {pts.map((p, i) => {
            const outlier = outIdx === i;
            return (
              <circle
                key={i}
                cx={toX(p.x)}
                cy={toY(p.y)}
                r={outlier ? 5 : 4}
                fill={outlier ? "#dc2626" : "#0284c7"}
              />
            );
          })}
          {yL ? (
            <text
              x={8}
              y={PAD.t + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 8 ${PAD.t + plotH / 2})`}
              className="fill-stone-500 text-[9px]"
            >
              {yL}
            </text>
          ) : null}
          {xL ? (
            <text
              x={PAD.l + plotW / 2}
              y={CHART_H - 4}
              textAnchor="middle"
              className="fill-stone-500 text-[9px]"
            >
              {xL}
            </text>
          ) : null}
        </svg>
      </div>
    );
  };

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-3 py-3">
      {title ? (
        <figcaption className="mb-2 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <div className={secondary ? "flex flex-col gap-4 sm:flex-row" : undefined}>
        {panel(
          secondary ? "Graph A" : undefined,
          points,
          trendLine,
          outlierIndex,
          xLabel,
          yLabel,
        )}
        {secondary
          ? panel(
              secondary.label,
              secondary.points,
              secondary.trendLine,
              undefined,
              secondary.xLabel ?? xLabel,
              secondary.yLabel ?? yLabel,
            )
          : null}
      </div>
    </figure>
  );
}

const PIE_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#64748b"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

function PieChartDisplay({
  title,
  sectors,
}: {
  title?: string;
  sectors: { label: string; value: number }[];
}) {
  const total = sectors.reduce((s, x) => s + x.value, 0) || 1;
  const cx = 80;
  const cy = 80;
  const r = 64;
  let angle = 0;
  const slices = sectors.map((s, i) => {
    const sweep = (s.value / total) * 360;
    const path = pieSlicePath(cx, cy, r, angle, angle + sweep);
    angle += sweep;
    return { path, label: s.label, value: s.value, color: PIE_COLORS[i % PIE_COLORS.length]! };
  });

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      {title ? (
        <figcaption className="mb-2 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0" role="img" aria-label={title ?? "Pie chart"}>
          {slices.map((s) => (
            <path key={s.label} d={s.path} fill={s.color} stroke="#fff" strokeWidth={1} />
          ))}
        </svg>
        <ul className="text-xs text-stone-700">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2 capitalize">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label} ({s.value})
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

function AngleDiagramDisplay({
  label,
  degrees,
  rayLabels,
}: {
  label?: string;
  degrees: number;
  rayLabels?: [string, string];
}) {
  const cx = 40;
  const cy = 120;
  const len = 90;
  const rad = (degrees * Math.PI) / 180;
  const x2 = cx + len * Math.cos(-rad / 2);
  const y2 = cy - len * Math.sin(-rad / 2);
  const x3 = cx + len * Math.cos(rad / 2);
  const y3 = cy - len * Math.sin(rad / 2);
  const arcR = 28;
  const arcEnd = polarToCartesian(cx, cy, arcR, -degrees / 2);
  const arcStart = polarToCartesian(cx, cy, arcR, degrees / 2);

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Angle diagram
      </p>
      {label ? <p className="mt-1 text-sm text-stone-800">{label}</p> : null}
      <svg viewBox="0 0 200 140" className="mx-auto mt-2 w-full max-w-xs" role="img" aria-label={`Angle ${degrees} degrees`}>
        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#1c1917" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={x3} y2={y3} stroke="#1c1917" strokeWidth={2} />
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth={2}
        />
        <text x={cx + 36} y={cy - 8} className="fill-stone-700 text-[11px]">
          {degrees}°
        </text>
        {rayLabels ? (
          <>
            <text x={x2 - 8} y={y2 + 4} className="fill-stone-600 text-[9px]">
              {rayLabels[0]}
            </text>
            <text x={x3 + 4} y={y3 + 4} className="fill-stone-600 text-[9px]">
              {rayLabels[1]}
            </text>
          </>
        ) : null}
      </svg>
    </figure>
  );
}

function CoordinatePlotDisplay({
  title,
  xLabel,
  yLabel,
  xMin = 0,
  xMax = 10,
  yMin = 0,
  yMax = 10,
  points,
}: {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  points: { x: number; y: number }[];
}) {
  const plotW = CHART_W - PAD.l - PAD.r;
  const plotH = CHART_H - PAD.t - PAD.b;
  const toX = (x: number) => PAD.l + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const toY = (y: number) => PAD.t + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;
  const gridX = xMax - xMin;
  const gridY = yMax - yMin;

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-3 py-3">
      {title ? (
        <figcaption className="mb-2 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mx-auto w-full max-w-md" role="img">
        {Array.from({ length: gridX + 1 }, (_, i) => {
          const x = toX(xMin + i);
          return (
            <line
              key={`gx${i}`}
              x1={x}
              y1={PAD.t}
              x2={x}
              y2={PAD.t + plotH}
              stroke="#e7e5e4"
              strokeWidth={0.5}
            />
          );
        })}
        {Array.from({ length: gridY + 1 }, (_, i) => {
          const y = toY(yMin + i);
          return (
            <line
              key={`gy${i}`}
              x1={PAD.l}
              y1={y}
              x2={PAD.l + plotW}
              y2={y}
              stroke="#e7e5e4"
              strokeWidth={0.5}
            />
          );
        })}
        <line x1={PAD.l} y1={PAD.t + plotH} x2={PAD.l + plotW} y2={PAD.t + plotH} stroke="#a8a29e" />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + plotH} stroke="#a8a29e" />
        {points.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={4} fill="#0284c7" />
        ))}
        {xLabel ? (
          <text x={PAD.l + plotW / 2} y={CHART_H - 4} textAnchor="middle" className="fill-stone-500 text-[9px]">
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text x={8} y={PAD.t + plotH / 2} textAnchor="middle" transform={`rotate(-90 8 ${PAD.t + plotH / 2})`} className="fill-stone-500 text-[9px]">
            {yLabel}
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

/** Unit vector: clockwise from North in SVG (y increases downward). */
function bearingUnit(bearing: number) {
  const rad = (bearing * Math.PI) / 180;
  return { x: Math.sin(rad), y: -Math.cos(rad) };
}

function formatBearing(b: number) {
  const n = Math.round(b) % 360;
  return String(n).padStart(3, "0") + "°";
}

function BearingDiagramDisplay({
  label,
  bearing,
  bearing2,
}: {
  label?: string;
  bearing: number;
  bearing2?: number;
}) {
  const ox = 100;
  const oy = 115;
  const len = 72;
  const n = bearingUnit(bearing);
  const x1 = ox + n.x * len;
  const y1 = oy + n.y * len;
  const rays: { x: number; y: number; b: number; stroke: string }[] = [
    { x: x1, y: y1, b: bearing, stroke: "#0284c7" },
  ];
  if (bearing2 != null) {
    const u2 = bearingUnit(bearing2);
    rays.push({
      x: ox + u2.x * len,
      y: oy + u2.y * len,
      b: bearing2,
      stroke: "#f59e0b",
    });
  }

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Bearing diagram
      </p>
      {label ? <p className="mt-1 text-sm text-stone-800">{label}</p> : null}
      <svg viewBox="0 0 200 150" className="mx-auto mt-2 w-full max-w-sm" role="img" aria-label={`Bearing ${formatBearing(bearing)}`}>
        <circle cx={ox} cy={oy} r={3} fill="#1c1917" />
        <line x1={ox} y1={oy} x2={ox} y2={oy - 28} stroke="#78716c" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={ox + 4} y={oy - 30} className="fill-stone-700 text-[10px] font-semibold">
          N
        </text>
        {rays.map((r, i) => (
          <g key={i}>
            <line x1={ox} y1={oy} x2={r.x} y2={r.y} stroke={r.stroke} strokeWidth={2.5} />
            <text x={r.x + r.x * 0.08} y={r.y + r.y * 0.08} className="fill-stone-700 text-[9px]">
              {formatBearing(r.b)}
            </text>
          </g>
        ))}
        {bearing2 == null ? (
          <path
            d={`M ${ox} ${oy - 18} A 18 18 0 ${bearing > 180 ? 1 : 0} 1 ${ox + n.x * 18} ${oy + n.y * 18}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth={1.5}
          />
        ) : null}
      </svg>
    </figure>
  );
}

function NetDiagramDisplay({
  label,
  solid,
  edgeCm,
}: {
  label?: string;
  solid: "cuboid" | "triangularPrism" | "squarePyramid" | "cone" | "cylinder";
  edgeCm?: number;
}) {
  const edge = edgeCm != null ? `${edgeCm} cm` : null;
  const title =
    solid === "cuboid"
      ? "Cuboid net"
      : solid === "triangularPrism"
        ? "Triangular prism net"
        : solid === "squarePyramid"
          ? "Square-based pyramid net"
          : solid === "cone"
            ? "Cone net"
            : "Cylinder net";

  const body = (() => {
    switch (solid) {
      case "cuboid":
        return (
          <g stroke="#1c1917" strokeWidth={1.5} fill="#fafaf9">
            <rect x={70} y={20} width={60} height={40} />
            <rect x={70} y={60} width={60} height={40} />
            <rect x={10} y={60} width={60} height={40} />
            <rect x={130} y={60} width={60} height={40} />
            <rect x={70} y={100} width={60} height={40} />
            <rect x={70} y={140} width={60} height={40} />
          </g>
        );
      case "triangularPrism":
        return (
          <g stroke="#1c1917" strokeWidth={1.5} fill="#fafaf9">
            <polygon points="40,30 100,30 70,10" />
            <rect x={40} y={30} width={60} height={50} />
            <polygon points="40,80 100,80 70,100" />
          </g>
        );
      case "squarePyramid":
        return (
          <g stroke="#1c1917" strokeWidth={1.5} fill="#fafaf9">
            <rect x={60} y={60} width={50} height={50} />
            <polygon points="60,60 85,20 110,60" />
            <polygon points="110,60 130,85 110,110" />
            <polygon points="60,110 85,130 110,110" />
            <polygon points="60,60 35,85 60,110" />
          </g>
        );
      case "cone":
        return (
          <g stroke="#1c1917" strokeWidth={1.5} fill="#fafaf9">
            <path d="M 40 90 A 40 40 0 1 1 120 90 L 80 20 Z" />
            <circle cx={80} cy={105} r={28} fill="#fff" />
          </g>
        );
      case "cylinder":
        return (
          <g stroke="#1c1917" strokeWidth={1.5} fill="#fafaf9">
            <rect x={35} y={45} width={90} height={55} />
            <ellipse cx={35} cy={72} rx={12} ry={28} />
            <ellipse cx={125} cy={72} rx={12} ry={28} />
            <circle cx={35} cy={25} r={22} fill="#fff" />
            <circle cx={125} cy={25} r={22} fill="#fff" />
          </g>
        );
    }
  })();

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {title}
      </p>
      {label ? <p className="mt-1 text-sm text-stone-800">{label}</p> : null}
      {edge ? <p className="text-xs text-stone-600">Edge length shown: {edge}</p> : null}
      <svg viewBox="0 0 160 160" className="mx-auto mt-2 h-40 w-full max-w-xs" role="img" aria-label={title}>
        {body}
      </svg>
    </figure>
  );
}

function CircleDiagramDisplay({
  label,
  radiusCm,
  diameterCm,
  sectorDegrees,
}: {
  label?: string;
  radiusCm?: number;
  diameterCm?: number;
  sectorDegrees?: number;
}) {
  const cx = 90;
  const cy = 90;
  const r = radiusCm ?? (diameterCm != null ? diameterCm / 2 : 40);
  const displayR = Math.min(52, Math.max(28, r * 4));
  const sector = sectorDegrees ?? 0;
  const sectorPath =
    sector > 0 && sector < 360
      ? pieSlicePath(cx, cy, displayR, 0, sector)
      : sector >= 360
        ? null
        : null;

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Circle diagram
      </p>
      {label ? <p className="mt-1 text-sm text-stone-800">{label}</p> : null}
      <svg viewBox="0 0 180 180" className="mx-auto mt-2 w-full max-w-xs" role="img" aria-label={label ?? "Circle"}>
        <circle cx={cx} cy={cy} r={displayR} fill="#fff" stroke="#1c1917" strokeWidth={2} />
        {sectorPath ? <path d={sectorPath} fill="#bae6fd" stroke="none" /> : null}
        <line x1={cx} y1={cy} x2={cx + displayR} y2={cy} stroke="#0284c7" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill="#1c1917" />
        <text x={cx + displayR / 2} y={cy - 6} textAnchor="middle" className="fill-stone-700 text-[10px]">
          r = {r} cm
        </text>
        {sector > 0 ? (
          <text x={cx} y={cy + displayR + 16} textAnchor="middle" className="fill-stone-600 text-[10px]">
            sector {sector}°
          </text>
        ) : diameterCm != null ? (
          <text x={cx} y={cy + displayR + 16} textAnchor="middle" className="fill-stone-600 text-[10px]">
            diameter {diameterCm} cm
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

function ParallelLinesDiagramDisplay({
  label,
  markedAngle,
}: {
  label?: string;
  markedAngle: number;
}) {
  const yTop = 50;
  const yBot = 110;
  const xL = 24;
  const xR = 176;
  const tx1 = 36;
  const ty1 = 130;
  const tx2 = 164;
  const ty2 = 30;
  const ix = 88;
  const iy = yTop;

  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Parallel lines
      </p>
      {label ? <p className="mt-1 text-sm text-stone-800">{label}</p> : null}
      <svg viewBox="0 0 200 150" className="mx-auto mt-2 w-full max-w-sm" role="img" aria-label={`Parallel lines, angle ${markedAngle} degrees`}>
        <line x1={xL} y1={yTop} x2={xR} y2={yTop} stroke="#1c1917" strokeWidth={2} />
        <line x1={xL} y1={yBot} x2={xR} y2={yBot} stroke="#1c1917" strokeWidth={2} />
        <text x={xR - 8} y={yTop - 6} className="fill-stone-500 text-[8px]">
          ||
        </text>
        <text x={xR - 8} y={yBot - 6} className="fill-stone-500 text-[8px]">
          ||
        </text>
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#57534e" strokeWidth={2} />
        <path
          d={`M ${ix + 14} ${iy} A 14 14 0 0 0 ${ix + 10} ${iy + 12}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth={2}
        />
        <text x={ix + 22} y={iy + 10} className="fill-sky-700 text-[11px] font-medium">
          {markedAngle}°
        </text>
      </svg>
    </figure>
  );
}

export function FigureView({ spec }: Props) {
  switch (spec.type) {
    case "tally":
      return (
        <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Tally chart
          </p>
          <p className="text-sm capitalize text-stone-800">{spec.label}</p>
          <TallyMarks count={spec.count} />
        </div>
      );
    case "tallyMarks":
      return (
        <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Tally
          </p>
          <TallyMarks count={spec.count} />
        </div>
      );
    case "barChart":
      return (
        <div className="mt-3">
          <BarChartDisplay title={spec.title} categories={spec.categories} />
        </div>
      );
    case "lineChart":
      return (
        <div className="mt-3">
          <LineChartDisplay
            title={spec.title}
            xLabel={spec.xLabel}
            yLabel={spec.yLabel}
            series={spec.series}
          />
        </div>
      );
    case "scatterGraph":
      return (
        <div className="mt-3">
          <ScatterGraphDisplay
            title={spec.title}
            xLabel={spec.xLabel}
            yLabel={spec.yLabel}
            points={spec.points}
            trendLine={spec.trendLine}
            outlierIndex={spec.outlierIndex}
            secondary={spec.secondary}
          />
        </div>
      );
    case "pictogram": {
      const symbol = spec.symbol ?? "★";
      const unit = spec.unitLabel ?? "One symbol = one";
      if (spec.rows?.length) {
        return (
          <div className="mt-3 space-y-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Pictogram
            </p>
            {spec.rows.map((row) => (
              <div key={row.label}>
                <p className="text-sm capitalize text-stone-800">{row.label}</p>
                <p className="mt-1 text-2xl tracking-widest text-amber-600">
                  {symbol.repeat(Math.max(0, row.value))}
                </p>
              </div>
            ))}
            <p className="text-xs text-stone-600">{unit}</p>
          </div>
        );
      }
      const count = spec.count ?? 0;
      return (
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Pictogram
          </p>
          <p className="mt-2 text-2xl tracking-widest text-amber-600">
            {symbol.repeat(Math.max(0, count))}
          </p>
          <p className="mt-1 text-xs text-stone-600">{unit}</p>
        </div>
      );
    }
    case "frequencyTable": {
      const catHead = spec.columnLabels?.category ?? "Category";
      const valHead = spec.columnLabels?.value ?? "Frequency";
      return (
        <div className="mt-3 overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-left text-xs uppercase text-stone-600">
              <tr>
                <th className="px-3 py-2">{catHead}</th>
                <th className="px-3 py-2">{valHead}</th>
              </tr>
            </thead>
            <tbody>
              {spec.rows.map((row) => (
                <tr key={row.label} className="border-t border-stone-200">
                  <td className="px-3 py-2 capitalize text-stone-800">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-stone-800">
                    {row.value === 0 ? "\u00a0" : row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "pieChart":
      return (
        <div className="mt-3">
          <PieChartDisplay title={spec.title} sectors={spec.sectors} />
        </div>
      );
    case "angleDiagram":
      return (
        <div className="mt-3">
          <AngleDiagramDisplay
            label={spec.label}
            degrees={spec.degrees}
            rayLabels={spec.rayLabels}
          />
        </div>
      );
    case "coordinatePlot":
      return (
        <div className="mt-3">
          <CoordinatePlotDisplay
            title={spec.title}
            xLabel={spec.xLabel}
            yLabel={spec.yLabel}
            xMin={spec.xMin}
            xMax={spec.xMax}
            yMin={spec.yMin}
            yMax={spec.yMax}
            points={spec.points}
          />
        </div>
      );
    case "bearingDiagram":
      return (
        <div className="mt-3">
          <BearingDiagramDisplay
            label={spec.label}
            bearing={spec.bearing}
            bearing2={spec.bearing2}
          />
        </div>
      );
    case "netDiagram":
      return (
        <div className="mt-3">
          <NetDiagramDisplay
            label={spec.label}
            solid={spec.solid}
            edgeCm={spec.edgeCm}
          />
        </div>
      );
    case "circleDiagram":
      return (
        <div className="mt-3">
          <CircleDiagramDisplay
            label={spec.label}
            radiusCm={spec.radiusCm}
            diameterCm={spec.diameterCm}
            sectorDegrees={spec.sectorDegrees}
          />
        </div>
      );
    case "parallelLinesDiagram":
      return (
        <div className="mt-3">
          <ParallelLinesDiagramDisplay
            label={spec.label}
            markedAngle={spec.markedAngle}
          />
        </div>
      );
    default:
      return null;
  }
}
