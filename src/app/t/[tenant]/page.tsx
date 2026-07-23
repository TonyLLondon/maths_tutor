import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { isTenantId } from "@/lib/tenants";

type Props = { params: Promise<{ tenant: string }> };

export default async function TenantHomePage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  await requireSession(tenant);
  redirect(`/t/${tenant}/subjects`);
}
