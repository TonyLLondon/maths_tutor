export type NavCrumb = {
  label: string;
  href?: string;
};

export function subjectsCrumb(tenant: string): NavCrumb {
  return { label: "Subjects", href: `/t/${tenant}/subjects` };
}

export function mathsCrumb(tenant: string): NavCrumb {
  return { label: "Maths", href: `/t/${tenant}/subjects/maths` };
}

/** Breadcrumb trail for maths topic flows (Subjects › Maths › …). */
export function mathsTopicTrail(
  tenant: string,
  topicTitle: string,
  topicHref: string,
  current?: string,
): NavCrumb[] {
  const trail: NavCrumb[] = [
    subjectsCrumb(tenant),
    mathsCrumb(tenant),
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

export function chessHomeTrail(tenant: string): NavCrumb[] {
  return [subjectsCrumb(tenant), { label: "Chess" }];
}
