import type { GcseDomain } from "./topics/catalog";
import { TOPICS } from "./topics/catalog";

export type SubjectId = "maths" | "chess";

export type SubjectConfig = {
  id: SubjectId;
  name: string;
  description: string;
  /** Full Edexcel 1MA1 Foundation spine — see `_backlog/state/gcse-foundation-spine.json`. */
  seedTopicCount: number;
};

export const SUBJECTS: Record<SubjectId, SubjectConfig> = {
  maths: {
    id: "maths",
    name: "Maths",
    description: "All Edexcel Foundation topic codes — worksheets fill in over time.",
    seedTopicCount: TOPICS.length,
  },
  chess: {
    id: "chess",
    name: "Chess",
    description: "Learn opening moves by playing short games against the computer.",
    seedTopicCount: 0,
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
