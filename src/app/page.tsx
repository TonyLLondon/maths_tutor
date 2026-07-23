import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEFAULT_TENANT } from "@/lib/tenants";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(`/t/${session.tenant}`);
  }
  redirect("/login");
}
