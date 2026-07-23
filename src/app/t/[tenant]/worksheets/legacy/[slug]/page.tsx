import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { worksheetHref } from "@/lib/paths";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetView } from "@/components/WorksheetView";
import { subjectsCrumb } from "@/lib/nav-crumbs";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function LegacyWorksheetPage({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);

  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const href = worksheetHref(tenant, slug);

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={[
          subjectsCrumb(tenant),
          { label: "Worksheets", href: `/t/${tenant}/worksheets` },
          { label: doc.frontmatter.title },
        ]}
      />
      <WorksheetView tenant={tenant} doc={doc} baseHref={href} />
    </>
  );
}
