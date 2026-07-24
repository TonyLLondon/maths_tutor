export type GcseDomain =
  | "number"
  | "algebra"
  | "ratio"
  | "geometry"
  | "probability"
  | "statistics";

export type AssessmentObjective = "AO1" | "AO2" | "AO3";

export type Topic = {
  code: string;
  domain: GcseDomain;
  title: string;
  summary: string;
  age9Focus: string;
};

export const DOMAIN_LABELS: Record<GcseDomain, string> = {
  number: "Number",
  algebra: "Algebra",
  ratio: "Ratio, proportion & rates of change",
  geometry: "Geometry & measures",
  probability: "Probability",
  statistics: "Statistics",
};

/** Short blurbs for the domain picker (child-readable). */
export const DOMAIN_SUMMARIES: Record<GcseDomain, string> = {
  number: "Whole numbers, fractions, decimals, and negatives.",
  algebra: "Equations, sequences, and graphs.",
  ratio: "Sharing, scaling, and speed/density type problems.",
  geometry: "Shapes, angles, area, volume, and Pythagoras.",
  probability: "Likelihood, experiments, and expected outcomes.",
  statistics: "Charts, averages, and comparing data sets.",
};
