import { redirect } from "next/navigation";
import { isTenantId } from "@/lib/tenants";

type Props = { params: Promise<{ tenant: string }> };

export default async function LegacyTopicsRedirect({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  redirect(`/t/${tenant}/subjects/maths`);
}
