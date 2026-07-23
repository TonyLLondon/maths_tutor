import { redirect } from "next/navigation";
import { worksheetHref } from "@/lib/paths";
import { isTenantId } from "@/lib/tenants";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function LegacyPrintRedirect({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  redirect(worksheetHref(tenant, slug));
}
