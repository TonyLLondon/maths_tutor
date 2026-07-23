import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetView } from "@/components/WorksheetView";
import { mathsTopicHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function WorksheetFullPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const baseHref = mathsTopicHref(tenant, domain, code);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <WorksheetView tenant={tenant} doc={doc} baseHref={baseHref} />
    </>
  );
}
