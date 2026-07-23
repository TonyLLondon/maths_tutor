import type { Topic } from "./topics/catalog-types";
import { kidTitleFor } from "./topics/archer-path";

export function primaryTopicLabel(t: Topic): string {
  return kidTitleFor(t.domain, t.code, t.title, t.age9Focus || undefined);
}
