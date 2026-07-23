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

export const TOPICS: Topic[] = [
  {
    code: "N3",
    domain: "number",
    title: "Order of operations",
    summary: "BIDMAS, brackets, powers",
    age9Focus: "Multi-step calculations with × ÷ + −",
  },
  {
    code: "N4",
    domain: "number",
    title: "Factors, multiples & primes",
    summary: "HCF, LCM, prime factorisation",
    age9Focus: "Factor pairs, listing multiples, simple HCF",
  },
  {
    code: "N1",
    domain: "number",
    title: "Ordering numbers",
    summary: "Integers, decimals, fractions, inequality symbols",
    age9Focus: "Order FDP; negatives on a number line",
  },
  {
    code: "N10",
    domain: "number",
    title: "Fractions & decimals",
    summary: "Interchange FDP",
    age9Focus: "Tenths, hundredths, equivalent fractions",
  },
  {
    code: "N12",
    domain: "number",
    title: "Fraction & percentage of amounts",
    summary: "Operators on quantities",
    age9Focus: "½ of, 10% of, simple shop contexts",
  },
  {
    code: "N14",
    domain: "number",
    title: "Estimate & check",
    summary: "Rounding before calculating",
    age9Focus: "Round then multiply; sense-check answers",
  },
  {
    code: "A1",
    domain: "algebra",
    title: "Notation & missing numbers",
    summary: "Symbols for unknowns",
    age9Focus: "□ + 7 = 15, function machines",
  },
  {
    code: "A23",
    domain: "algebra",
    title: "Sequences",
    summary: "Term-to-term and nth term (later)",
    age9Focus: "Add/subtract rules from tables",
  },
  {
    code: "A8",
    domain: "algebra",
    title: "Graphs",
    summary: "y = mx + c, plotting",
    age9Focus: "Coordinates, tables, simple lines",
  },
  {
    code: "R1",
    domain: "ratio",
    title: "Sharing in a ratio",
    summary: "Part–part and part–whole",
    age9Focus: "Counters, bar models, for every…",
  },
  {
    code: "R5",
    domain: "ratio",
    title: "Scale & maps",
    summary: "Scale drawings",
    age9Focus: "London map distances, recipe scaling",
  },
  {
    code: "G1",
    domain: "geometry",
    title: "Shape vocabulary",
    summary: "Angles, parallel, perpendicular",
    age9Focus: "Properties of triangles & quadrilaterals",
  },
  {
    code: "G14",
    domain: "geometry",
    title: "Area & perimeter",
    summary: "Compound shapes",
    age9Focus: "Rectangles, L-shapes, units",
  },
  {
    code: "G16",
    domain: "geometry",
    title: "Volume (intro)",
    summary: "Cubes and cuboids",
    age9Focus: "Counting unit cubes",
  },
  {
    code: "P1",
    domain: "probability",
    title: "Equally likely outcomes",
    summary: "Single events",
    age9Focus: "Dice, spinners, fair vs unfair",
  },
  {
    code: "S1",
    domain: "statistics",
    title: "Collect & present data",
    summary: "Tables and charts",
    age9Focus: "Tally, bar chart, read values",
  },
  {
    code: "S4",
    domain: "statistics",
    title: "Averages",
    summary: "Mean from a list",
    age9Focus: "Mean of small integer sets",
  },
];

export function topicByCode(code: string): Topic | undefined {
  return TOPICS.find((t) => t.code === code);
}

export function topicsByDomain(domain: GcseDomain): Topic[] {
  return TOPICS.filter((t) => t.domain === domain);
}
