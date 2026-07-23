import type { GcseDomain } from "./topics/catalog";
import { DOMAIN_LABELS, TOPICS } from "./topics/catalog";

export type SubjectId = "maths";

export type SubjectConfig = {
  id: SubjectId;
  name: string;
  description: string;
  /** GCSE Foundation seed topics for age 9 — not the full exam checklist. */
  seedTopicCount: number;
};

export const SUBJECTS: Record<SubjectId, SubjectConfig> = {
  maths: {
    id: "maths",
    name: "Maths",
    description: "GCSE-aligned topics for age 9 (Foundation seeds)",
    seedTopicCount: TOPICS.length,
  },
};

export const MATHS_DOMAINS: GcseDomain[] = [
  "number",
  "algebra",
  "ratio",
  "geometry",
  "probability",
  "statistics",
];

export function isSubjectId(value: string): value is SubjectId {
  return value in SUBJECTS;
}

export function mathsTopicPath(domain: GcseDomain, code: string): string {
  return `${domain}/${code}`;
}

export {
  DOMAIN_LABELS,
  TOPICS,
  topicsByDomain,
  topicByCode,
} from "./topics/catalog";
