import type { GcseDomain } from "./catalog-types";

/** Curated route for age 9 — full GCSE spine remains under “All topics”. */
export type PathTopic = {
  domain: GcseDomain;
  code: string;
  kidTitle: string;
};

export const ARCHER_PATH: PathTopic[] = [
  { domain: "number", code: "N1", kidTitle: "Putting numbers in order" },
  { domain: "number", code: "N3", kidTitle: "Order of operations (BIDMAS)" },
  { domain: "number", code: "N4", kidTitle: "Factors and multiples" },
  { domain: "number", code: "N10", kidTitle: "Fractions and decimals" },
  { domain: "number", code: "N12", kidTitle: "Fractions and percentages of amounts" },
  { domain: "number", code: "N14", kidTitle: "Estimating and checking" },
  { domain: "algebra", code: "A1", kidTitle: "Missing numbers and function machines" },
  { domain: "algebra", code: "A8", kidTitle: "Coordinates and simple graphs" },
  { domain: "algebra", code: "A23", kidTitle: "Number sequences" },
  { domain: "ratio", code: "R1", kidTitle: "Sharing in a ratio" },
  { domain: "ratio", code: "R5", kidTitle: "Scale and maps" },
  { domain: "geometry", code: "G1", kidTitle: "Shapes and angles" },
  { domain: "geometry", code: "G14", kidTitle: "Area and perimeter" },
  { domain: "geometry", code: "G16", kidTitle: "Area and volume of shapes" },
  { domain: "probability", code: "P1", kidTitle: "Dice, spinners and fairness" },
  { domain: "statistics", code: "S1", kidTitle: "Tally charts and bar charts" },
  { domain: "statistics", code: "S4", kidTitle: "Averages (mean, median, mode)" },
];

const pathKey = (domain: string, code: string) => `${domain}/${code}`;

export function kidTitleFor(
  domain: GcseDomain,
  code: string,
  fallbackTitle: string,
  age9Focus?: string,
): string {
  const hit = ARCHER_PATH.find((p) => p.domain === domain && p.code === code);
  if (hit) return hit.kidTitle;
  if (age9Focus) return age9Focus;
  return fallbackTitle;
}

export function isOnArcherPath(domain: string, code: string): boolean {
  return ARCHER_PATH.some(
    (p) => p.domain === domain && p.code === code,
  );
}

export { pathKey };
