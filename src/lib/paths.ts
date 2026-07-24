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
