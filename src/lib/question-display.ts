/** Section headings from worksheets — hide exam jargon in the UI. */
export function friendlySectionHeading(section: string): string {
  return section.replace(/\s*\(AO\d\)\s*/gi, "").trim();
}
