import { redirect } from "next/navigation";
import { mathsPrintHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function RedirectTopicPrint({ params }: Props) {
  const { tenant, domain, code } = await params;
  redirect(mathsPrintHref(tenant, domain, code));
}
