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
