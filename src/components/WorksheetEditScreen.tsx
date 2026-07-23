import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet, serializeWorksheet } from "@/lib/content";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetEditor } from "@/components/WorksheetEditor";
import {
  mathsTopicTrail,
  subjectsCrumb,
  type NavCrumb,
} from "@/lib/nav-crumbs";
import { mathsTopicHref, worksheetHref } from "@/lib/paths";

export async function WorksheetEditScreen({
  tenant,
  slug,
}: {
  tenant: string;
  slug: string;
}) {
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);

  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const raw = serializeWorksheet(doc.frontmatter, doc.body);

  const slash = slug.indexOf("/");
  let crumbs: NavCrumb[];
  if (slash > 0) {
    const domain = slug.slice(0, slash);
    const code = slug.slice(slash + 1);
    crumbs = mathsTopicTrail(
      tenant,
      doc.frontmatter.title,
      mathsTopicHref(tenant, domain, code),
      "Edit",
    );
  } else {
    crumbs = [
      subjectsCrumb(tenant),
      { label: "Worksheets", href: `/t/${tenant}/worksheets` },
      { label: doc.frontmatter.title, href: worksheetHref(tenant, slug) },
      { label: "Edit" },
    ];
  }

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={crumbs}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900">Edit worksheet</h1>
        <p className="mt-2 text-sm text-stone-600">
          For parents: change the text below, then save. Children usually use
          Go on this topic instead.
        </p>
        <WorksheetEditor tenant={tenant} slug={slug} initialMarkdown={raw} />
      </main>
    </>
  );
}
