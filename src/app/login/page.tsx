import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  const { next } = await searchParams;
  if (session) {
    redirect(
      next?.startsWith("/") ? next : `/t/${session.tenant}/subjects`,
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-stone-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Maths tutor
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Sign in</h1>
        <p className="mt-2 text-sm text-stone-600">Type your first name.</p>
        <LoginForm nextPath={next} />
      </div>
    </div>
  );
}
