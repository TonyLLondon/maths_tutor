import { redirect } from "next/navigation";
import { mathsPracticeHref } from "@/lib/paths";
import { isTenantId } from "@/lib/tenants";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

/** Legacy print URLs → questions. */
export default async function PrintRedirect({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) redirect("/login");
  redirect(mathsPracticeHref(tenant, domain, code));
}
