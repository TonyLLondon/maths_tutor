"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import type { NavCrumb } from "@/lib/nav-crumbs";
import type { TenantId } from "@/lib/tenants";

export function TenantNav({
  tenantId: _tenantId,
  userName,
  crumbs,
}: {
  tenantId: TenantId;
  userName: string;
  crumbs: NavCrumb[];
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-stone-500">{userName}</p>
          <nav aria-label="Breadcrumb" className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            {crumbs.map((crumb, i) => (
              <Fragment key={`${crumb.label}-${i}`}>
                {i > 0 ? (
                  <span className="text-stone-300 select-none" aria-hidden>
                    /
                  </span>
                ) : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate text-stone-600 hover:text-stone-900"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-stone-900">
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
