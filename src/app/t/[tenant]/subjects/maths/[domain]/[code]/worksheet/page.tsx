import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetView } from "@/components/WorksheetView";
import { mathsTopicTrail } from "@/lib/nav-crumbs";
import { mathsTopicHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function WorksheetFullPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const baseHref = mathsTopicHref(tenant, domain, code);

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={mathsTopicTrail(
          tenant,
          doc.frontmatter.title,
          baseHref,
          "Worksheet",
        )}
      />
      <WorksheetView tenant={tenant} doc={doc} baseHref={baseHref} />
    </>
  );
}
