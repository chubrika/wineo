"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "მთავარი" },
  { href: "/buy", label: "იყიდე" },
  { href: "/rent", label: "იქირავე" },
  { href: "/news", label: "სიახლეები" },
  { href: "/about", label: "ჩვენ შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-6 w-5 flex-col justify-center" aria-hidden>
      <span
        className={`block h-0.5 w-5 bg-zinc-700 transition-all duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`}
      />
      <span
        className={`mt-1 block h-0.5 w-5 bg-zinc-700 transition-all duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
      />
    </span>
  );
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

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <header className="relative z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-zinc-900"
          onClick={() => setMenuOpen(false)}
        >
          <Image src="/logo.svg" alt="wineo.ge" width={100} height={100} priority />
        </Link>

        {/* Desktop nav */}
        <nav
          className="nav-font-medium hidden items-center gap-6 lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link text-[20px] font-medium ${isActive(pathname, href) ? "nav-link-active" : ""}`}
              aria-current={isActive(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          {!loading &&
            (user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nav-link-active)] text-sm font-medium text-white transition-opacity hover:opacity-90"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  {getUserInitials(user.firstName, user.lastName, user.email)}
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full z-[100] mt-2 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg"
                    role="menu"
                  >
                    <div className="border-b border-zinc-100 px-4 py-2">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {getUserDisplayName(user.firstName, user.lastName, user.email)}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="nav-link w-full px-4 py-2 text-left text-sm font-medium hover:bg-zinc-50"
                      role="menuitem"
                    >
                      გასვლა
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`nav-link text-[20px] font-medium ${isActive(pathname, "/login") ? "nav-link-active" : ""}`}
                aria-current={isActive(pathname, "/login") ? "page" : undefined}
              >
                შესვლა
              </Link>
            ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={`nav-font-medium overflow-hidden transition-[height,opacity] duration-300 ease-out lg:hidden ${menuOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="border-t border-zinc-200 bg-white px-4 py-4 sm:px-6"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-[18px] font-medium transition-colors ${isActive(pathname, href) ? "nav-link-active bg-zinc-100" : "nav-link hover:bg-zinc-50"}`}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
            {!loading &&
              (user ? (
                <li className="border-t border-zinc-200 pt-2 mt-2">
                  <span className="block px-3 py-2 text-sm font-medium text-zinc-900">
                    {getUserDisplayName(user.firstName, user.lastName, user.email)}
                  </span>
                  <span className="block px-3 pb-2 text-xs text-zinc-500">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-3 text-left text-[18px] font-medium nav-link hover:bg-zinc-50"
                  >
                    გასვლა
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-lg px-3 py-3 text-[18px] font-medium transition-colors ${isActive(pathname, "/login") ? "nav-link-active bg-zinc-100" : "nav-link hover:bg-zinc-50"}`}
                  >
                    შესვლა
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
