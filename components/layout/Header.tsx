"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useFiltersModal } from "@/contexts/FiltersModalContext";
import { HeaderSearchBar } from "./HeaderSearchBar";
import { SlidersHorizontalIcon } from "lucide-react";

const navLinks = [
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

function MobileBottomNavIcon({ icon, active }: { icon: string; active: boolean }) {
  const className = `w-6 h-6 shrink-0 ${active ? "text-[var(--nav-link-active)]" : "text-zinc-500"}`;
  if (icon === "home") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (icon === "buy") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  if (icon === "rent") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (icon === "filters") {
    return <SlidersHorizontalIcon className={className} aria-hidden />;
  }
  if (icon === "account") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  return null;
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();
  const { openFiltersModal } = useFiltersModal();

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
    <>
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold tracking-tight text-zinc-900"
          onClick={() => setMenuOpen(false)}
        >
          <Image src="/logo.svg" alt="wineo.ge" width={100} height={100} priority />
        </Link>

        {/* Mobile: filters button after logo (home only) */}
        {pathname === "/" && (
          <button
            type="button"
            onClick={openFiltersModal}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#8a052d] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d0423] lg:hidden"
            aria-label="დეტალური ფილტრები"
          >
            <SlidersHorizontalIcon className="h-5 w-5 shrink-0" />
          </button>
        )}

        {/* Search — before nav */}
        <div className="hidden flex-1 min-w-0 items-center justify-center gap-3 lg:flex">
          {pathname === "/" && (
            <button
              type="button"
              onClick={openFiltersModal}
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#8a052d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d0423]"
              aria-label="დეტალური ფილტრები"
            >
              <SlidersHorizontalIcon className="h-5 w-5 shrink-0" />
              ფილტრები
            </button>
          )}
          <HeaderSearchBar />
        </div>

        {/* Desktop nav */}
        <nav
          className="nav-font-medium hidden shrink-0 items-center gap-6 lg:flex"
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
                      <p className="truncate text-sm normal-font font-medium text-zinc-900">
                        {getUserDisplayName(user.firstName, user.lastName, user.email)}
                      </p>
                      <p className="truncate text-xs normal-font text-zinc-500">{user.email}</p>
                    </div>
                  <div className="flex flex-col gap-2">
                  <Link
                        href="/profile"
                        className="nav-link border-b border-zinc-100 cursor-pointer w-full px-4 py-2 text-left text-sm normal-font font-medium hover:bg-zinc-50"
                      >
                        პროფილი
                      </Link>
                      <Link
                        href="/products"
                        className="nav-link border-b border-zinc-100 cursor-pointer w-full px-4 py-2 text-left text-sm normal-font font-medium hover:bg-zinc-50"
                      >
                        განცხადებები
                      </Link>
                  </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="nav-link cursor-pointer w-full px-4 py-2 text-left text-sm normal-font font-medium hover:bg-zinc-50"
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
        className={`nav-font-medium overflow-hidden transition-[height,opacity] duration-300 ease-out lg:hidden ${menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        {/* Search — before nav on mobile */}
        <div className="border-t border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:px-6">
          <HeaderSearchBar />
        </div>
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
                  className={`block rounded-lg px-3 py-1 text-[18px] font-medium transition-colors ${isActive(pathname, href) ? "nav-link-active bg-zinc-100" : "nav-link hover:bg-zinc-50"}`}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
            {!loading &&
              (user ? (
                <li className="border-t border-zinc-200 pt-2 mt-2">
                  {/* <span className="block px-3 py-2 text-sm font-medium text-zinc-900">
                    {getUserDisplayName(user.firstName, user.lastName, user.email)}
                  </span>
                  <span className="block px-3 pb-2 text-xs text-zinc-500">{user.email}</span> */}
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

    {/* Mobile bottom navigation */}
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile bottom navigation"
    >
        {pathname !== "/" && (
      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 ${isActive(pathname, "/") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="home" active={pathname === "/"} />
        <span className="text-xs font-medium truncate w-full text-center">მთავარი</span>
      </Link>
      )}
      {pathname === "/" && (
        <button
          type="button"
          onClick={openFiltersModal}
          className="flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 text-zinc-600"
          aria-label="ფილტრები"
        >
          <MobileBottomNavIcon icon="filters" active={false} />
          <span className="text-xs font-medium truncate w-full text-center">ფილტრები</span>
        </button>
      )}
      <Link
        href="/buy"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 ${isActive(pathname, "/buy") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={isActive(pathname, "/buy") ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="buy" active={isActive(pathname, "/buy")} />
        <span className="text-xs font-medium truncate w-full text-center">იყიდე</span>
      </Link>
      <Link
        href="/rent"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 ${isActive(pathname, "/rent") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={isActive(pathname, "/rent") ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="rent" active={isActive(pathname, "/rent")} />
        <span className="text-xs font-medium truncate w-full text-center">იქირავე</span>
      </Link>
      {!loading && user ? (
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 ${isActive(pathname, "/profile") ? "nav-link-active" : "text-zinc-600"}`}
            aria-current={isActive(pathname, "/profile") ? "page" : undefined}
          >
            <MobileBottomNavIcon icon="account" active={isActive(pathname, "/profile")} />
            <span className="text-xs font-medium truncate w-full text-center">ანგარიში</span>
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 flex-1 ${isActive(pathname, "/login") ? "nav-link-active" : "text-zinc-600"}`}
            aria-current={isActive(pathname, "/login") ? "page" : undefined}
          >
            <MobileBottomNavIcon icon="account" active={isActive(pathname, "/login")} />
            <span className="text-xs font-medium truncate w-full text-center">ანგარიში</span>
          </Link>
        )}
    </nav>
    </>
  );
}
