import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { worksheetHref } from "@/lib/paths";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetView } from "@/components/WorksheetView";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function LegacyWorksheetPage({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const href = worksheetHref(tenant, slug);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <WorksheetView tenant={tenant} doc={doc} baseHref={href} />
    </>
  );
}
