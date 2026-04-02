"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import Image from "next/image";

const accountNavLinks = [
  { href: "/add-product", label: "განცხადების დამატება" },
  { href: "/products", label: "ჩემი განცხადებები" },
  { href: "/wishlist", label: "სურვილების სია" },
  { href: "/profile", label: "პროფილი" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile";
  if (href === "/products") return pathname === "/products" || pathname.startsWith("/products/");
  if (href === "/add-product") return pathname === "/add-product";
  if (href === "/wishlist") return pathname === "/wishlist";
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

export function AccountNavContent({
  onNavigate,
  className = "",
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <nav className={`rounded-xl border border-zinc-200 bg-white p-2 ${className}`}>
      <div className="mb-2 flex items-center gap-3 border-b border-zinc-100 px-3 pb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--nav-link-active)] text-sm font-medium text-white"
          aria-hidden
        >
          {!loading && user
            ? user.picture ? <Image src={user.picture} alt="User picture" width={36} height={36} className="rounded-full" unoptimized /> : 
            <User className="h-5 w-5 shrink-0" />
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
        {accountNavLinks.map(({ href, label }) => {
          const isAddProduct = href === "/add-product";
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[14px] font-medium transition-colors ${
                  isAddProduct
                    ? active
                      ? "text-green-700 bg-green-50"
                      : "text-green-600 hover:bg-green-50 hover:text-green-700"
                    : active
                      ? "nav-link-active"
                      : "nav-link"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {isAddProduct && (
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-zinc-100 pt-2">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[14px] font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          გასვლა
        </button>
      </div>
    </nav>
  );
}
