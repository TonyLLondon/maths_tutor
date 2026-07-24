import { getWorksheet } from "./content";
import { getTopicProgressState } from "./progress";
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

  return Promise.all(
    topics.map(async (t) => {
      const slug = `${domain}/${t.code}`;
      const ws = await getWorksheet(tenant, slug);
      const level = ws
        ? (await getTopicProgressState(userId, "maths", slug)).rating
        : null;
      return { domain, t, ws, level, familyInsights: [] as ChildTopicInsight[] };
    }),
  );
}

export async function countWorksheetsInDomain(
  tenant: string,
  domain: GcseDomain,
): Promise<{ ready: number; total: number }> {
  const topics = topicsByDomain(domain);
  let ready = 0;
  for (const t of topics) {
    if (await getWorksheet(tenant, `${domain}/${t.code}`)) ready += 1;
  }
  return { ready, total: topics.length };
}
