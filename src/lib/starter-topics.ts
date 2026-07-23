import fs from "node:fs/promises";
import path from "node:path";
import type { GcseDomain } from "./topics/catalog-types";
import type { TenantId } from "./tenants";

export type StarterTopic = {
  domain: GcseDomain;
  code: string;
  label: string;
};

type StarterFile = {
  version: number;
  topics: StarterTopic[];
};

const cache = new Map<string, StarterTopic[]>();

export async function loadStarterTopics(
  tenantId: TenantId,
): Promise<StarterTopic[]> {
  const cached = cache.get(tenantId);
  if (cached) return cached;

  const file = path.join(
    process.cwd(),
    "content",
    "tenants",
    tenantId,
    "starter-topics.json",
  );
  try {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as StarterFile;
    const topics = data.topics ?? [];
    cache.set(tenantId, topics);
    return topics;
  } catch {
    return [];
  }
}

export function kidTitleForTopic(
  starter: StarterTopic[] | undefined,
  domain: GcseDomain,
  code: string,
  fallbackTitle: string,
  age9Focus?: string,
): string {
  const hit = starter?.find((p) => p.domain === domain && p.code === code);
  if (hit?.label) return hit.label;
  if (age9Focus) return age9Focus;
  return fallbackTitle;
}

export function starterTopicKey(domain: string, code: string): string {
  return `${domain}/${code}`;
}
