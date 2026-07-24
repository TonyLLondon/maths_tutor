import { readRepoWorksheet } from "./content";
import { getTopicRatingsBatch } from "./progress";
import type { GcseDomain } from "./topics/catalog";
import { topicsByDomain } from "./topics/catalog";
import type { MathsTopicListRow } from "@/components/MathsTopicRow";
import type { ChildTopicInsight } from "@/lib/family-progress";

export async function loadMathsTopicListRows(
  tenant: string,
  userId: string,
  domain: GcseDomain,
): Promise<MathsTopicListRow[]> {
  const topics = topicsByDomain(domain);
  const slugs = topics.map((t) => `${domain}/${t.code}`);

  const [worksheets, ratings] = await Promise.all([
    Promise.all(slugs.map((slug) => readRepoWorksheet(tenant, slug))),
    getTopicRatingsBatch(userId, "maths", slugs),
  ]);

  return topics.map((t, i) => {
    const slug = slugs[i]!;
    const ws = worksheets[i];
    return {
      domain,
      t,
      ws,
      level: ws ? (ratings.get(slug) ?? null) : null,
      familyInsights: [] as ChildTopicInsight[],
    };
  });
}

export async function countWorksheetsInDomain(
  tenant: string,
  domain: GcseDomain,
): Promise<{ ready: number; total: number }> {
  const topics = topicsByDomain(domain);
  const flags = await Promise.all(
    topics.map((t) => readRepoWorksheet(tenant, `${domain}/${t.code}`)),
  );
  const ready = flags.filter(Boolean).length;
  return { ready, total: topics.length };
}
