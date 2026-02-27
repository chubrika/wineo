"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const accountNavLinks = [
  { href: "/add-product", label: "განცხადების დამატება" },
  { href: "/products", label: "ჩემი განცხადებები" },
  { href: "/profile", label: "პროფილი" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile";
  if (href === "/products") return pathname === "/products" || pathname.startsWith("/products/");
  if (href === "/add-product") return pathname === "/add-product";
  return pathname === href || pathname.startsWith(href + "/");
}

function getUserInitials(firstName: string, lastName: string, email: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (email?.length >= 2) return email.slice(0, 2).toUpperCase();
  return "?";
}

function getUserDisplayName(firstName: string, lastName: string, email: string) {
  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  return email || "";
}

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <aside
      className="w-full shrink-0 lg:w-56"
      aria-label="Account navigation"
    >
      <nav className="rounded-xl border border-zinc-200 bg-white p-2">
        <div className="mb-2 flex items-center gap-3 border-b border-zinc-100 px-3 pb-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--nav-link-active)] text-sm font-medium text-white"
            aria-hidden
          >
            {!loading && user
              ? getUserInitials(user.firstName, user.lastName, user.email)
              : "—"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 normal-font">
              {!loading && user
                ? getUserDisplayName(user.firstName, user.lastName, user.email)
                : "იტვირთება..."}
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-0.5">
          {accountNavLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block rounded-lg px-4 py-2 text-[14px] font-medium transition-colors ${
                  isActive(pathname, href)
                    ? "nav-link-active"
                    : "nav-link"
                }`}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
