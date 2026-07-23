import { WorksheetEditScreen } from "@/components/WorksheetEditScreen";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function Page({ params }: Props) {
  const { tenant, slug } = await params;
  return <WorksheetEditScreen tenant={tenant} slug={slug} />;
}
