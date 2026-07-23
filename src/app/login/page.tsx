import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEFAULT_TENANT, TENANTS } from "@/lib/tenants";
import { LoginForm } from "./LoginForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  const { next } = await searchParams;
  if (session) {
    redirect(next?.startsWith("/") ? next : `/t/${session.tenant}`);
  }

  const tenant = TENANTS[DEFAULT_TENANT];

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-stone-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Maths tutor
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Sign in as {tenant.name}
        </h1>
        <p className="mt-2 text-sm text-stone-600">{tenant.subtitle}</p>
        <LoginForm tenantId={DEFAULT_TENANT} nextPath={next} />
        <p className="mt-6 text-xs text-stone-400">
          Content lives in GitHub; edits on Vercel save to KV per tenant.
        </p>
      </div>
      <Link
        href="https://github.com/TonyLLondon/maths_tutor"
        className="mt-6 text-sm text-stone-500 underline"
      >
        TonyLLondon/maths_tutor
      </Link>
    </div>
  );
}
