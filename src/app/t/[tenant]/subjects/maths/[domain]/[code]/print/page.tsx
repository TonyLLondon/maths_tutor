import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { isTenantId } from "@/lib/tenants";
import { WorksheetPrintPage } from "@/components/WorksheetPrintPage";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function PrintPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const doc = await getWorksheet(tenant, `${domain}/${code}`);
  if (!doc) notFound();

  return (
    <WorksheetPrintPage tenant={tenant} slug={`${domain}/${code}`} />
  );
}
