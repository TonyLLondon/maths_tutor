import type { Topic } from "./topics/catalog-types";
import type { TenantId } from "./tenants";
import {
  kidTitleForTopic,
  loadStarterTopics,
  type StarterTopic,
} from "./starter-topics";

export async function primaryTopicLabel(
  tenantId: TenantId,
  t: Topic,
): Promise<string> {
  const starter = await loadStarterTopics(tenantId);
  return kidTitleForTopic(
    starter,
    t.domain,
    t.code,
    t.title,
    t.age9Focus || undefined,
  );
}

/** Sync helper when starter list is already loaded (e.g. server page). */
export function primaryTopicLabelWithStarter(
  starter: StarterTopic[] | undefined,
  t: Topic,
): string {
  return kidTitleForTopic(
    starter,
    t.domain,
    t.code,
    t.title,
    t.age9Focus || undefined,
  );
}
