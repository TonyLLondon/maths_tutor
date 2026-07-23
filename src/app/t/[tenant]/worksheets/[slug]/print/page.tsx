import { notFound } from "next/navigation";
import { WorksheetPrintPage } from "@/components/WorksheetPrintPage";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function Page({ params }: Props) {
  const { tenant, slug } = await params;
  return <WorksheetPrintPage tenant={tenant} slug={slug} />;
}
