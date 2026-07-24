import type { StemVisual } from "@/lib/question-visual";

type Props = {
  visual: StemVisual;
};

function TallyMarks({ count }: { count: number }) {
  const cells: boolean[] = [];
  for (let i = 0; i < count; i += 1) {
    cells.push(true);
  }
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
  items,
}: {
  title?: string;
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((x) => x.value), 1);
  const scaleMax = Math.ceil(max * 1.15);
  return (
    <figure className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      {title ? (
        <figcaption className="mb-3 text-center text-sm font-medium text-stone-800">
          {title}
        </figcaption>
      ) : null}
      <div className="flex items-end justify-center gap-4" style={{ minHeight: 120 }}>
        {items.map(({ label, value }) => (
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

export function QuestionVisual({ visual }: Props) {
  switch (visual.type) {
    case "tally":
      return (
        <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Tally chart
          </p>
          <p className="text-sm capitalize text-stone-800">{visual.label}</p>
          <TallyMarks count={visual.count} />
        </div>
      );
    case "tally-marks":
      return (
        <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Tally
          </p>
          <TallyMarks count={visual.count} />
        </div>
      );
    case "bar-single":
      return (
        <div className="mt-3">
          <BarChartDisplay
            items={[{ label: visual.label, value: visual.value }]}
          />
        </div>
      );
    case "bar-chart":
      return (
        <div className="mt-3">
          <BarChartDisplay title={visual.title} items={visual.items} />
        </div>
      );
    case "pictogram":
      return (
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Pictogram
          </p>
          <p className="mt-2 text-2xl tracking-widest text-amber-600">
            {visual.symbol.repeat(visual.count)}
          </p>
          <p className="mt-1 text-xs text-stone-600">One symbol = one child</p>
        </div>
      );
    case "frequency-table":
      return (
        <div className="mt-3 overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-left text-xs uppercase text-stone-600">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {visual.rows.map((row) => (
                <tr key={row.label} className="border-t border-stone-200">
                  <td className="px-3 py-2 capitalize text-stone-800">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-stone-800">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}
