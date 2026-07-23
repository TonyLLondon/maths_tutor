import { WorksheetEditScreen } from "@/components/WorksheetEditScreen";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function Page({ params }: Props) {
  const { tenant, domain, code } = await params;
  return <WorksheetEditScreen tenant={tenant} slug={`${domain}/${code}`} />;
}
