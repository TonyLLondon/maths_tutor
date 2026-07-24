export type NavCrumb = {
  label: string;
  href?: string;
};

import type { GcseDomain } from "./topics/catalog-types";
import { DOMAIN_LABELS } from "./topics/catalog";
import { mathsDomainHref } from "./paths";

export function subjectsCrumb(tenant: string): NavCrumb {
  return { label: "Subjects", href: `/t/${tenant}/subjects` };
}

export function mathsCrumb(tenant: string): NavCrumb {
  return { label: "Maths", href: `/t/${tenant}/subjects/maths` };
}

export function mathsDomainCrumb(
  tenant: string,
  domain: GcseDomain,
): NavCrumb {
  return {
    label: DOMAIN_LABELS[domain],
    href: mathsDomainHref(tenant, domain),
  };
}

export function mathsDomainTrail(
  tenant: string,
  domain: GcseDomain,
): NavCrumb[] {
  return [subjectsCrumb(tenant), mathsCrumb(tenant), { label: DOMAIN_LABELS[domain] }];
}

/** Breadcrumb trail for maths topic flows (Subjects › Maths › domain › …). */
export function mathsTopicTrail(
  tenant: string,
  domain: GcseDomain,
  topicTitle: string,
  topicHref: string,
  current?: string,
): NavCrumb[] {
  const trail: NavCrumb[] = [
    subjectsCrumb(tenant),
    mathsCrumb(tenant),
    mathsDomainCrumb(tenant, domain),
    current
      ? { label: topicTitle, href: topicHref }
      : { label: topicTitle },
  ];
  if (current) {
    trail.push({ label: current });
  }
  return trail;
}

export function subjectsHomeTrail(_tenant: string): NavCrumb[] {
  return [{ label: "Subjects" }];
}

export function mathsHomeTrail(tenant: string): NavCrumb[] {
  return [subjectsCrumb(tenant), { label: "Maths" }];
}

export function chessCrumb(tenant: string): NavCrumb {
  return { label: "Chess", href: `/t/${tenant}/subjects/chess` };
}

export function familyHomeTrail(tenant: string): NavCrumb[] {
  return [
    subjectsCrumb(tenant),
    { label: "Family progress", href: `/t/${tenant}/family` },
  ];
}

export function familySubjectTrail(
  tenant: string,
  subjectLabel: string,
): NavCrumb[] {
  return [...familyHomeTrail(tenant), { label: subjectLabel }];
}

export function chessHomeTrail(tenant: string): NavCrumb[] {
  return [subjectsCrumb(tenant), { label: "Chess" }];
}
