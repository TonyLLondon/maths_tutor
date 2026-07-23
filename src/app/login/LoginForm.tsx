"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TenantId } from "@/lib/tenants";

type Props = {
  tenantId: TenantId;
  nextPath?: string;
};

export function LoginForm({ tenantId, nextPath }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: tenantId, name }),
      });
      if (!res.ok) {
        setError("Type your name exactly: Archer");
        return;
      }
      const dest =
        nextPath && nextPath.startsWith("/") ? nextPath : `/t/${tenantId}`;
      router.push(dest);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-stone-700"
        >
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Archer"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-stone-400 focus:ring-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "One moment…" : "Go to worksheets"}
      </button>
    </form>
  );
}
