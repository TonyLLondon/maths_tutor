import type { SubjectId } from "./subjects";

export function familyHubHref(tenant: string): string {
  return `/t/${tenant}/family`;
}

export function familySubjectHref(tenant: string, subject: SubjectId): string {
  return `/t/${tenant}/family/${subject}`;
}

/** @deprecated use {@link familySubjectHref}(tenant, "maths") */
export function mathsFamilyHref(tenant: string): string {
  return familySubjectHref(tenant, "maths");
}

export function mathsDomainHref(tenant: string, domain: string): string {
  return `/t/${tenant}/subjects/maths/${encodeURIComponent(domain)}`;
}

export function mathsTopicHref(
  tenant: string,
  domain: string,
  code: string,
): string {
  return `/t/${tenant}/subjects/maths/${encodeURIComponent(domain)}/${encodeURIComponent(code)}`;
}

export function mathsPracticeHref(
  tenant: string,
  domain: string,
  code: string,
): string {
  return `${mathsTopicHref(tenant, domain, code)}/practice`;
}

export function mathsLearnHubHref(tenant: string): string {
  return `/t/${tenant}/subjects/maths/learn`;
}

export function mathsLearnDomainHref(tenant: string, domain: string): string {
  return `/t/${tenant}/subjects/maths/learn/${encodeURIComponent(domain)}`;
}

export function mathsLearnTopicHref(
  tenant: string,
  domain: string,
  code: string,
): string {
  return `/t/${tenant}/subjects/maths/learn/${encodeURIComponent(domain)}/${encodeURIComponent(code)}`;
}

export function mathsLearnWordsHref(tenant: string): string {
  return `/t/${tenant}/subjects/maths/learn/words`;
}

export function mathsLearnWordHref(tenant: string, slug: string): string {
  return `/t/${tenant}/subjects/maths/learn/words/${encodeURIComponent(slug)}`;
}

/** Resolve tenant-agnostic links in support/help markdown (`mtlearn:geometry/G15`, `mtlearn:word/bearing`). */
export function resolveMtLearnHref(tenant: string, href: string): string | null {
  if (!href.startsWith("mtlearn:")) return null;
  const rest = href.slice("mtlearn:".length);
  if (rest.startsWith("word/")) {
    const slug = rest.slice("word/".length);
    if (!/^[a-z0-9-]+$/.test(slug)) return null;
    return mathsLearnWordHref(tenant, slug);
  }
  const slash = rest.indexOf("/");
  if (slash === -1) {
    return mathsLearnDomainHref(tenant, rest);
  }
  const domain = rest.slice(0, slash);
  const code = rest.slice(slash + 1);
  if (!domain || !code) return null;
  return mathsLearnTopicHref(tenant, domain, code);
}

/** Legacy flat worksheets (non-topic path). */
export function worksheetHref(tenant: string, slug: string): string {
  if (slug.includes("/")) {
    const [domain, code] = slug.split("/");
    return mathsTopicHref(tenant, domain, code);
  }
  return `/t/${tenant}/worksheets/legacy/${encodeURIComponent(slug)}`;
}

export function apiWorksheetPath(tenant: string, slug: string): string {
  if (slug.includes("/")) {
    const [domain, code] = slug.split("/");
    return `/api/t/${tenant}/worksheets/${encodeURIComponent(domain)}/${encodeURIComponent(code)}`;
  }
  return `/api/t/${tenant}/worksheets/legacy/${encodeURIComponent(slug)}`;
}

export function apiProgressPath(
  tenant: string,
  domain: string,
  code: string,
): string {
  return `/api/t/${tenant}/subjects/maths/${encodeURIComponent(domain)}/${encodeURIComponent(code)}/progress`;
}

export function apiQuestionSupportPath(
  tenant: string,
  domain: string,
  code: string,
  questionId: string,
): string {
  const base = `/api/t/${tenant}/subjects/maths/${encodeURIComponent(domain)}/${encodeURIComponent(code)}/support`;
  return `${base}?questionId=${encodeURIComponent(questionId)}`;
}
