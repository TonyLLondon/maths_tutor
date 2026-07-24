/** Section headings from worksheets — hide exam jargon in the UI. */
export function friendlySectionHeading(section: string): string {
  return section.replace(/\s*\(AO\d\)\s*/gi, "").trim();
}

/** Child-readable practice grouping (domain · code · topic title). */
export function formatPracticeTopicLine(opts: {
  domainLabel: string;
  topicCode: string;
  topicTitle: string;
  topicSummary?: string;
}): string {
  const parts = [
    opts.domainLabel,
    opts.topicCode,
    opts.topicTitle,
  ];
  if (opts.topicSummary) parts.push(opts.topicSummary);
  return parts.join(" · ");
}
