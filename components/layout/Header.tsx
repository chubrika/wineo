"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useFiltersModal } from "@/contexts/FiltersModalContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { HeaderSearchBar } from "./HeaderSearchBar";
import { AccountNavContent } from "@/components/account/AccountNavContent";
import { CategoriesModal } from "./CategoriesModal";
import { SlidersHorizontalIcon, Heart, LayoutGrid, ChevronDownIcon, Home, ShoppingBag, Clock, User, CirclePlus, Search } from "lucide-react";

const SCROLL_THRESHOLD = 80; // min pixels scrolled before we change show/hide
const SCROLL_TOP_SHOW = 10;
const SUBHEADER_COOLDOWN_MS = 350; // min ms between hide/show to prevent flicker

const navLinks = [
  { href: "/buy", label: "იყიდე" },
  { href: "/rent", label: "იქირავე" },
  { href: "/news", label: "სიახლეები" },
  { href: "/events", label: "ღონისძიებები" },
  { href: "/about", label: "ჩვენ შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isAccountPath(pathname: string) {
  return pathname === "/profile" || pathname === "/products" || pathname.startsWith("/products/") || pathname === "/wishlist" || pathname === "/add-product";
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-6 w-5 flex-col justify-center gap-1" aria-hidden>
      <span
        className={`block h-0.5 w-5 shrink-0 bg-zinc-700 transition-all duration-200 origin-center ${open ? "translate-y-[6px] rotate-45" : ""}`}
      />
      <span
        className={`block h-0.5 w-5 shrink-0 bg-zinc-700 transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`}
      />
      <span
        className={`block h-0.5 w-5 shrink-0 bg-zinc-700 transition-all duration-200 origin-center ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
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
  const baseClass = "w-6 h-6 shrink-0";
  const className =
    icon === "add"
      ? `${baseClass} text-[var(--wineo-red)]`
      : `${baseClass} ${active ? "text-[var(--nav-link-active)]" : "text-zinc-500"}`;
  if (icon === "home") return <Home className={className} aria-hidden />;
  if (icon === "buy") return <ShoppingBag className={className} aria-hidden />;
  if (icon === "rent") return <Clock className={className} aria-hidden />;
  if (icon === "filters") return <SlidersHorizontalIcon className={className} aria-hidden />;
  if (icon === "account") return <User className={className} aria-hidden />;
  if (icon === "add") return <CirclePlus className={className} aria-hidden />;
  return null;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollReady = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastToggleTime = useRef(0);
  const [subheaderVisible, setSubheaderVisible] = useState(true);
  const { user, loading, logout } = useAuth();
  const { openFiltersModal } = useFiltersModal();
  const { openLoginModal } = useLoginModal();
  const { count: favoritesCount } = useWishlist();

  const handleFavoritesClick = () => {
    if (user) {
      router.push("/wishlist");
      setMenuOpen(false);
    } else {
      openLoginModal();
    }
  };

  const handleAddProductClick = () => {
    if (user) {
      router.push("/add-product");
      setMenuOpen(false);
    } else {
      openLoginModal();
    }
  };

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (accountDrawerOpen) document.body.style.overflow = "hidden";
    else if (!menuOpen) document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [accountDrawerOpen, menuOpen]);

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

  useLayoutEffect(() => {
    lastScrollY.current = window.scrollY;
    const id = requestAnimationFrame(() => {
      scrollReady.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function update() {
      rafId.current = null;
      if (!scrollReady.current) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY <= SCROLL_TOP_SHOW) {
        setSubheaderVisible(true);
        lastScrollY.current = currentScrollY;
        lastToggleTime.current = 0; // allow hide soon after leaving top
        return;
      }
      const now = Date.now();
      const diff = currentScrollY - lastScrollY.current;
      if (diff >= SCROLL_THRESHOLD && now - lastToggleTime.current >= SUBHEADER_COOLDOWN_MS) {
        setSubheaderVisible(false);
        lastScrollY.current = currentScrollY;
        lastToggleTime.current = now;
      } else if (diff <= -SCROLL_THRESHOLD && now - lastToggleTime.current >= SUBHEADER_COOLDOWN_MS) {
        setSubheaderVisible(true);
        lastScrollY.current = currentScrollY;
        lastToggleTime.current = now;
      }
    }
    function onScroll() {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

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

        {/* Search — before nav */}
        <div className="hidden flex-1 min-w-0 items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => setCategoriesModalOpen(true)}
            className="flex items-center cursor-pointer gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-[var(--wineo-red)] focus:outline-none"
            aria-label="კატეგორიები"
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            <span className="hidden xl:inline">კატეგორიები</span>
            <ChevronDownIcon className="h-5 w-5 shrink-0" />
          </button>
          <HeaderSearchBar />
        </div>

        {/* Desktop actions (nav links are in subheader) */}
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={handleAddProductClick}
            className="flex items-center cursor-pointer gap-2 rounded-lg border border-zinc-300 bg-[#8a052d2e] px-3 py-2 text-sm font-medium transition-colors hover:bg-[#8a052d5c] text-[var(--wineo-red)] focus:outline-none"
            aria-label="განცხადების დამატება"
          >
            <CirclePlus className="h-5 w-5 shrink-0" />
            <span className="hidden xl:inline">განცხადების დამატება</span>
          </button>
          <button
            type="button"
            onClick={handleFavoritesClick}
            className="relative cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:text-[var(--wineo-red)] focus:outline-none"
            aria-label={user ? "სურვილების სია" : "სურვილების სია (შედით ანგარიშში)"}
          >
            <Heart className="h-6 w-6" strokeWidth={2} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full wineo-red-bg text-xs font-medium text-white tabular-nums">
              {favoritesCount}
            </span>
          </button>
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
                      <Link
                        href="/wishlist"
                        className="nav-link border-b border-zinc-100 cursor-pointer w-full px-4 py-2 text-left text-sm normal-font font-medium hover:bg-zinc-50"
                      >
                        სურვილების სია
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
              <button
                type="button"
                onClick={openLoginModal}
                className="nav-link cursor-pointer text-[16px] font-medium"
              >
                შესვლა
              </button>
            ))}
        </div>

        {/* Mobile: wishlist + menu icons (grouped on the right) */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-[var(--wineo-red)] focus:outline-none"
            aria-expanded={mobileSearchOpen}
            aria-label={mobileSearchOpen ? "ძებნის დახურვა" : "ძებნა"}
          >
            <Search className="h-6 w-6" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleFavoritesClick}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-[var(--wineo-red)] focus:outline-none"
            aria-label={user ? "ფავორიტები" : "ფავორიტები (შედით ანგარიშში)"}
          >
            <Heart className="h-6 w-6" strokeWidth={2} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--wineo-red)] text-xs font-medium text-white tabular-nums">
              {favoritesCount}
            </span>
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile: expandable search row */}
      {mobileSearchOpen && (
        <div className="border-t border-zinc-200 bg-zinc-50/80 px-4 py-3 lg:hidden">
          <HeaderSearchBar />
        </div>
      )}

      {/* Subheader: desktop only — hides on scroll down, shows on scroll up */}
      <div
        className={`hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t border-zinc-200 bg-zinc-50 lg:block ${
          subheaderVisible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!subheaderVisible}
      >
        <nav
          className="nav-font-medium mx-auto flex h-12 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-6">
            {navLinks.slice(0, -2).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link text-[20px] font-medium ${isActive(pathname, href) ? "nav-link-active" : ""}`}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6">
            {navLinks.slice(-2).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link text-[20px] font-medium ${isActive(pathname, href) ? "nav-link-active" : ""}`}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={`nav-font-medium overflow-hidden transition-[height,opacity] duration-300 ease-out lg:hidden ${menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
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
                  <button
                    type="button"
                    onClick={() => {
                      openLoginModal();
                      setMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-3 text-left text-[18px] font-medium nav-link hover:bg-zinc-50"
                  >
                    შესვლა
                  </button>
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
        className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 ${isActive(pathname, "/") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="home" active={pathname === "/"} />
        <span className="text-[10px] font-medium truncate w-full text-center">მთავარი</span>
      </Link>
      )}
      {pathname === "/" && (
        <button
          type="button"
          onClick={openFiltersModal}
          className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 text-zinc-600"
          aria-label="ფილტრები"
        >
          <MobileBottomNavIcon icon="filters" active={false} />
          <span className="text-[10px] font-medium truncate w-full text-center">ფილტრები</span>
        </button>
      )}
      <Link
        href="/buy"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 ${isActive(pathname, "/buy") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={isActive(pathname, "/buy") ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="buy" active={isActive(pathname, "/buy")} />
        <span className="text-[10px] font-medium truncate w-full text-center">იყიდე</span>
      </Link>
      <Link
        href="/add-product"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 ${isActive(pathname, "/add-product") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={isActive(pathname, "/add-product") ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="add" active={isActive(pathname, "/add-product")} />
        <span className="text-[10px] font-medium truncate w-full text-center wineo-red">დამატება</span>
      </Link>
      <Link
        href="/rent"
        onClick={() => setMenuOpen(false)}
        className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 ${isActive(pathname, "/rent") ? "nav-link-active" : "text-zinc-600"}`}
        aria-current={isActive(pathname, "/rent") ? "page" : undefined}
      >
        <MobileBottomNavIcon icon="rent" active={isActive(pathname, "/rent")} />
        <span className="text-[10px] font-medium truncate w-full text-center">იქირავე</span>
      </Link>
   
      {!loading && user ? (
          <button
            type="button"
            onClick={() => setAccountDrawerOpen(true)}
            className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 text-zinc-600`}
            aria-label="ანგარიში"
            aria-expanded={accountDrawerOpen}
          >
            <MobileBottomNavIcon icon="account" active={false} />
            <span className="text-[10px] font-medium truncate w-full text-center">ანგარიში</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              openLoginModal();
              setMenuOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 text-zinc-600`}
            aria-label="შესვლა"
          >
            <MobileBottomNavIcon icon="account" active={false} />
            <span className="text-[10px] font-medium truncate w-full text-center">ანგარიში</span>
          </button>
        )}
    </nav>

    {/* Mobile account drawer */}
    {accountDrawerOpen && (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
          aria-label="Close account menu"
          onClick={() => setAccountDrawerOpen(false)}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl lg:hidden pb-[env(safe-area-inset-bottom)]"
          role="dialog"
          aria-modal="true"
          aria-label="ანგარიში"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
            <span className="text-lg font-semibold text-zinc-900">ანგარიში</span>
            <button
              type="button"
              onClick={() => setAccountDrawerOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="დახურვა"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <AccountNavContent onNavigate={() => setAccountDrawerOpen(false)} />
          </div>
        </div>
      </>
    )}

    <CategoriesModal open={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} />
    </>
  );
}
