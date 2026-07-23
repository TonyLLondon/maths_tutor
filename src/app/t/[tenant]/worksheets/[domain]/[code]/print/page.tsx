import { redirect } from "next/navigation";
import { mathsPracticeHref } from "@/lib/paths";
import { isTenantId } from "@/lib/tenants";

type Props = { params: Promise<{ tenant: string; domain: string; code: string }> };

export default async function RedirectTopicPrint({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  redirect(mathsPracticeHref(tenant, domain, code));
}
