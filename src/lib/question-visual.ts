/** Infer a read-only diagram from common GCSE Foundation stats stems (no answer leakage). */

export type StemVisual =
  | { type: "tally"; label: string; count: number }
  | { type: "tally-marks"; count: number }
  | { type: "bar-single"; label: string; value: number; max?: number }
  | {
      type: "bar-chart";
      title?: string;
      items: { label: string; value: number }[];
    }
  | { type: "pictogram"; label?: string; symbol: string; count: number }
  | {
      type: "frequency-table";
      rows: { label: string; value: number }[];
    };

function stripMd(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function parseBarList(fragment: string): { label: string; value: number }[] {
  const items: { label: string; value: number }[] = [];
  const re = /([A-Za-z][A-Za-z\s]*?)\s+(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fragment)) !== null) {
    const label = m[1]!.trim();
    const value = parseInt(m[2]!, 10);
    if (label && Number.isFinite(value)) items.push({ label, value });
  }
  return items;
}

function tallyCountFromMarks(marks: string): number {
  return marks.replace(/[^|]/g, "").length;
}

export function inferStemVisual(markdown: string): StemVisual | null {
  const plain = stripMd(markdown);

  let m = plain.match(
    /tally chart shows (\d+) marks? for (.+?)(?:\.|$)/i,
  );
  if (m) {
    return {
      type: "tally",
      label: m[2]!.trim(),
      count: parseInt(m[1]!, 10),
    };
  }

  m = plain.match(/tally shows (\|+)(?:\s|\(|$)/i);
  if (m) {
    const count = tallyCountFromMarks(m[1]!);
    if (count > 0) return { type: "tally-marks", count };
  }

  m = plain.match(/tally for \*\*([^*]+)\*\* shows (\|+)/i);
  if (!m) m = plain.match(/tally for ([a-z]+) shows (\|+)/i);
  if (m) {
    const count = tallyCountFromMarks(m[2]!);
    if (count > 0) {
      return { type: "tally", label: m[1]!.trim(), count };
    }
  }

  m = plain.match(/bar chart has a bar reaching (\d+) for (\w+)/i);
  if (m) {
    const value = parseInt(m[1]!, 10);
    return {
      type: "bar-single",
      label: m[2]!,
      value,
      max: Math.max(10, value + 2),
    };
  }

  m = plain.match(
    /bar chart title: \*\*([^*]+)\*\* \(([^)]+)\)/i,
  );
  if (m) {
    const items = parseBarList(m[2]!);
    if (items.length >= 2) {
      return { type: "bar-chart", title: m[1]!.trim(), items };
    }
  }

  m = plain.match(/\(([^)]*\d+[^)]*)\)/);
  if (plain.toLowerCase().includes("bar chart") && m) {
    const items = parseBarList(m[1]!);
    if (items.length >= 2) {
      return { type: "bar-chart", items };
    }
  }

  m = plain.match(/(\d+) stars?(?:\.|$)/i);
  if (plain.toLowerCase().includes("pictogram") && m) {
    return {
      type: "pictogram",
      symbol: "★",
      count: parseInt(m[1]!, 10),
    };
  }

  m = plain.match(/table shows (\d+) (\w+) and (\d+) (\w+)/i);
  if (m) {
    return {
      type: "frequency-table",
      rows: [
        { label: m[2]!, value: parseInt(m[1]!, 10) },
        { label: m[4]!, value: parseInt(m[3]!, 10) },
      ],
    };
  }

  m = plain.match(/frequency table shows:?\s*([^.]+)/i);
  if (m) {
    const items = parseBarList(m[1]!);
    if (items.length >= 2) {
      return { type: "frequency-table", rows: items };
    }
  }

  return null;
}
