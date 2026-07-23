import type { GcseDomain } from "./catalog-types";
import spineData from "./spine.json";

export type { GcseDomain, AssessmentObjective, Topic } from "./catalog-types";
export { DOMAIN_LABELS } from "./catalog-types";

const AGE9_FOCUS: Partial<Record<string, string>> = {
  N1: "Order FDP; negatives on a number line",
  N3: "Multi-step calculations with × ÷ + −",
  N4: "Factor pairs, listing multiples, simple HCF",
  N10: "Tenths, hundredths, equivalent fractions",
  N12: "½ of, 10% of, simple shop contexts",
  N14: "Round then multiply; sense-check answers",
  A1: "□ + 7 = 15, function machines",
  A8: "Coordinates, tables, simple lines",
  A23: "Add/subtract rules from tables",
  R1: "Counters, bar models, for every…",
  R5: "London map distances, recipe scaling",
  G1: "Properties of triangles & quadrilaterals",
  G14: "Rectangles, L-shapes, units",
  G16: "Areas of triangles and parallelograms; cuboid volume",
  P1: "Dice, spinners, fair vs unfair",
  S1: "Tally, bar chart, read values",
  S4: "Mean, median, mode from small lists",
};

function codeNum(code: string): number {
  return parseInt(code.slice(1), 10) || 0;
}

export const TOPICS = spineData.topics
  .map((t) => ({
    code: t.code,
    domain: t.domain as GcseDomain,
    title: t.title,
    summary: t.title,
    age9Focus: AGE9_FOCUS[t.code] ?? "",
  }))
  .sort((a, b) => {
    if (a.domain !== b.domain) {
      const order: GcseDomain[] = [
        "number",
        "algebra",
        "ratio",
        "geometry",
        "probability",
        "statistics",
      ];
      return order.indexOf(a.domain) - order.indexOf(b.domain);
    }
    return codeNum(a.code) - codeNum(b.code);
  });

export function topicByCode(code: string) {
  return TOPICS.find((t) => t.code === code);
}

export function topicsByDomain(domain: GcseDomain) {
  return TOPICS.filter((t) => t.domain === domain);
}
