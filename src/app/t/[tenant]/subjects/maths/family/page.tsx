import { redirect } from "next/navigation";
import { familySubjectHref } from "@/lib/paths";
import { isTenantId } from "@/lib/tenants";

type Props = { params: Promise<{ tenant: string }> };

export default async function LegacyMathsFamilyRedirect({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  redirect(familySubjectHref(tenant, "maths"));
}
