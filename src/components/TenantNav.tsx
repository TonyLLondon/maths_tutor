"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavCrumb } from "@/lib/nav-crumbs";
import { familyHubHref } from "@/lib/paths";
import type { TenantId } from "@/lib/tenants";

export function TenantNav({
  tenantId,
  userName,
  crumbs,
  isParent,
}: {
  tenantId: TenantId;
  userName: string;
  crumbs: NavCrumb[];
  isParent?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const familyHref = familyHubHref(tenantId);
  const onFamilyPage = pathname.startsWith(`/t/${tenantId}/family`);

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
        <div className="flex shrink-0 items-center gap-1">
          {isParent ? (
            <Link
              href={familyHref}
              aria-current={onFamilyPage ? "page" : undefined}
              className={
                onFamilyPage
                  ? "rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-950"
                  : "rounded-lg px-3 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-50"
              }
            >
              Family progress
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
