import { redirect } from "next/navigation";
import { mathsTopicHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function RedirectTopicWorksheet({ params }: Props) {
  const { tenant, domain, code } = await params;
  redirect(mathsTopicHref(tenant, domain, code));
}
