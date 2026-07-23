/** Join Next.js catch-all segments into a content slug (e.g. number/N4). */
export function slugFromParams(segments: string[] | undefined): string {
  if (!segments?.length) return "";
  return segments.map(decodeURIComponent).join("/");
}

export function worksheetHref(tenant: string, slug: string): string {
  if (slug.includes("/")) {
    const [domain, code] = slug.split("/");
    return `/t/${tenant}/worksheets/${encodeURIComponent(domain)}/${encodeURIComponent(code)}`;
  }
  return `/t/${tenant}/worksheets/${encodeURIComponent(slug)}`;
}

export function apiWorksheetPath(tenant: string, slug: string): string {
  if (slug.includes("/")) {
    const [domain, code] = slug.split("/");
    return `/api/t/${tenant}/worksheets/${encodeURIComponent(domain)}/${encodeURIComponent(code)}`;
  }
  return `/api/t/${tenant}/worksheets/${encodeURIComponent(slug)}`;
}
