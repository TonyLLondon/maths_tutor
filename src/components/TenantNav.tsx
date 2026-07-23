"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { TenantId } from "@/lib/tenants";

const links = (tenant: TenantId) => [
  { href: `/t/${tenant}`, label: "Home" },
  { href: `/t/${tenant}/topics`, label: "Topics" },
  { href: `/t/${tenant}/worksheets`, label: "Worksheets" },
];

export function TenantNav({
  tenantId,
  tenantName,
}: {
  tenantId: TenantId;
  tenantName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {tenantName}
          </p>
          <p className="text-sm text-stone-600">GCSE-aligned worksheets</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {links(tenantId).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                pathname === l.href
                  ? "bg-stone-900 text-white"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void logout()}
            className="ml-2 rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
