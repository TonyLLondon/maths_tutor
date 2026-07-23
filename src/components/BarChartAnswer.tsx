"use client";

import type { BarChartSpec } from "@/lib/questions";

type Props = {
  spec: BarChartSpec;
  values: number[];
  onChange: (values: number[]) => void;
  disabled?: boolean;
};

export function BarChartAnswer({ spec, values, onChange, disabled }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600">
        Set each bar height (use 0 if none).
      </p>
      <ul className="space-y-2">
        {spec.labels.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm capitalize text-stone-800">
              {label}
            </span>
            <input
              type="number"
              min={0}
              step={1}
              disabled={disabled}
              value={Number.isFinite(values[i]) ? values[i] : 0}
              onChange={(e) => {
                const next = [...values];
                next[i] = parseInt(e.target.value, 10) || 0;
                onChange(next);
              }}
              className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
