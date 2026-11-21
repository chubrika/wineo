"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Wine, X } from "lucide-react";
import type { ApiGrape, ApiRegion, ApiWinery, WineryType } from "@/lib/api";
import { mapSlugForRegion } from "@/lib/encyclopedia";
import { WINEMAKING_METHOD_OPTIONS } from "@/lib/wineries";
import { WineryCard } from "./WineryCard";

const PAGE_SIZE = 6;

const TYPE_CHIPS: { value: "" | WineryType; label: string }[] = [
  { value: "", label: "ყველა ტიპი" },
  { value: "family", label: "ოჯახური" },
  { value: "organic", label: "ბიო / ორგანული" },
  { value: "industrial", label: "ინდუსტრიული" },
];

const EMPTY_FILTERS: WineryFilters = {
  search: "",
  region: "",
  grape: "",
  method: "",
  wineryType: "",
  acceptsVisitors: false,
};

export type WineryFilters = {
  search: string;
  region: string;
  grape: string;
  method: string;
  wineryType: "" | WineryType;
  acceptsVisitors: boolean;
};

function regionMatches(winery: ApiWinery, regionValue: string, regions: ApiRegion[]) {
  if (!regionValue) return true;
  const region = winery.region;
  if (!region) return false;
  if (region.id === regionValue || region.slug === regionValue) return true;
  const selected = regions.find((item) => item.id === regionValue || item.slug === regionValue);
  const wanted = mapSlugForRegion(selected || { slug: regionValue, label: regionValue });
  if (!wanted) return false;
  return mapSlugForRegion({ slug: region.slug, label: region.label }) === wanted;
}

function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full appearance-none rounded-full border border-transparent bg-[#f6f1ec] py-3 pl-5 pr-11 text-sm text-zinc-700 outline-none focus:border-[#721c24]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
    </div>
  );
}

export function WineriesView({
  regions,
  grapes,
  wineries,
  initial,
}: {
  regions: ApiRegion[];
  grapes: ApiGrape[];
  wineries: ApiWinery[];
  initial: WineryFilters;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<WineryFilters>(initial);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.region) params.set("region", filters.region);
    if (filters.grape) params.set("grape", filters.grape);
    if (filters.method) params.set("method", filters.method);
    if (filters.wineryType) params.set("type", filters.wineryType);
    if (filters.acceptsVisitors) params.set("visitors", "1");
    const next = params.toString();
    const current = new URLSearchParams({
      ...(initial.search ? { search: initial.search } : {}),
      ...(initial.region ? { region: initial.region } : {}),
      ...(initial.grape ? { grape: initial.grape } : {}),
      ...(initial.method ? { method: initial.method } : {}),
      ...(initial.wineryType ? { type: initial.wineryType } : {}),
      ...(initial.acceptsVisitors ? { visitors: "1" } : {}),
    }).toString();
    if (next === current && filters === initial) return;
    const handle = window.setTimeout(() => {
      router.replace(next ? `/wineries?${next}` : "/wineries", { scroll: false });
    }, filters.search === initial.search ? 0 : 300);
    return () => window.clearTimeout(handle);
    // URL sync follows the filter controls. `initial` is only the first server snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, router]);

  const sortedRegions = useMemo(
    () => [...regions].sort((a, b) => (a.index ?? 0) - (b.index ?? 0) || a.label.localeCompare(b.label, "ka")),
    [regions]
  );
  const sortedGrapes = useMemo(
    () => [...grapes].sort((a, b) => a.name.localeCompare(b.name, "ka")),
    [grapes]
  );
  const regionCount = useMemo(
    () => new Set(wineries.map((winery) => winery.region?.id).filter(Boolean)).size,
    [wineries]
  );

  const filtered = wineries.filter((winery) => {
    if (!regionMatches(winery, filters.region, sortedRegions)) return false;
    if (filters.grape) {
      const match = (winery.grapes ?? []).some((grape) => grape.id === filters.grape || grape.slug === filters.grape);
      if (!match) return false;
    }
    if (filters.wineryType && winery.wineryType !== filters.wineryType) return false;
    if (filters.method) {
      const methods = winery.winemakingMethods ?? [];
      if (!methods.some((method) => method === filters.method || method.includes(filters.method))) return false;
    }
    if (filters.acceptsVisitors && !winery.tourism?.acceptsVisitors) return false;
    const query = filters.search.trim().toLowerCase();
    if (!query) return true;
    const haystack = [winery.name, winery.tagline, winery.microzone, winery.address, winery.region?.label]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const filtersActive =
    Boolean(filters.search.trim() || filters.region || filters.grape || filters.method || filters.wineryType || filters.acceptsVisitors);

  function update(partial: Partial<WineryFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-4 md:px-0">
        <nav aria-label="breadcrumb" className="text-sm text-zinc-500">
          <Link href="/" className="hover:text-[#721c24]">
            მთავარი
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-zinc-800">მარნები</span>
        </nav>
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#8d7368] sm:justify-end">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#3c9a62]" aria-hidden />
          <span>{wineries.length} მარანი</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#e7cfc6]" aria-hidden />
          <span>{regionCount} რეგიონი</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#e7cfc6]" aria-hidden />
          <span>ტრადიციული ქვევრი & ბიო</span>
        </p>
      </div>

      <h1 className="mt-4 font-dejavu-sans font-bold text-4xl tracking-tight text-[#721c24] sm:text-5xl px-4 md:px-0">ქართული მარნები</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 px-4 md:px-0">
        აღმოაჩინეთ საქართველოს ოჯახური და ტრადიციული მარნები, ათასწლოვანი ქვევრის ღვინო, საკუთარი ვენახები და უნიკალური დეგუსტაციის ტურები.
      </p>

      <section className="mt-6 rounded-[28px] bg-white p-4 shadow-[0_10px_30px_rgba(60,40,20,0.05)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => update({ search: event.target.value })}
              placeholder="მოძებნეთ მარანი, სოფელი, მეღვინე..."
              aria-label="მარნის ძებნა"
              className="w-full rounded-full border border-transparent bg-[#f6f1ec] py-3 pl-11 pr-5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-[#721c24]"
            />
          </div>
          <SelectField label="რეგიონი" value={filters.region} onChange={(region) => update({ region })}>
            <option value="">ყველა რეგიონი</option>
            {sortedRegions.map((region) => (
              <option key={region.id} value={region.slug || region.id}>
                {region.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="ყურძნის ჯიში" value={filters.grape} onChange={(grape) => update({ grape })}>
            <option value="">ყურძნის ჯიში</option>
            {sortedGrapes.map((grape) => (
              <option key={grape.id} value={grape.slug}>
                {grape.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="დაყენების მეთოდი" value={filters.method} onChange={(method) => update({ method })}>
            <option value="">დაყენების მეთოდი</option>
            {WINEMAKING_METHOD_OPTIONS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1">
            {TYPE_CHIPS.map((chip) => {
              const active = filters.wineryType === chip.value;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update({ wineryType: chip.value })}
                  className={`rounded-full cursor-pointer px-4 py-2 text-sm ${
                    active ? "bg-[#f6e7ea] font-medium text-[#721c24]" : "text-zinc-600 hover:bg-[#f6f1ec]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={filters.acceptsVisitors}
            onClick={() => update({ acceptsVisitors: !filters.acceptsVisitors })}
            className="inline-flex items-center gap-2.5 whitespace-nowrap py-2 text-sm text-zinc-600"
          >
            <Wine className="h-4 w-4 shrink-0 text-[#721c24]" aria-hidden />
            იღებს სტუმრებს (დეგუსტაცია)
            <span
              className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full cursor-pointer p-0.5 transition-colors ${
                filters.acceptsVisitors ? "bg-[#721c24]" : "bg-zinc-300"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  filters.acceptsVisitors ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </button>
          <div className="flex items-center justify-between gap-4 text-sm lg:ml-auto lg:justify-end">
            <p className="text-zinc-500">
              ნაპოვნია: <span className="font-medium text-zinc-700">{wineries.length}</span>-დან <span className="font-medium text-zinc-700">{filtered.length}</span> შესაბამისი მარანი
            </p>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!filtersActive}
              className="inline-flex items-center gap-1.5 font-medium text-[#721c24] hover:underline disabled:cursor-default disabled:text-zinc-300 disabled:no-underline"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              გასუფთავება
            </button>
          </div>
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-white px-6 py-16 text-center text-sm text-zinc-500 shadow-[0_10px_30px_rgba(60,40,20,0.04)]">
          მარნები ვერ მოიძებნა. შეცვალეთ ფილტრები ან დაამატეთ მარანი ადმინ-პანელიდან.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((winery) => (
            <li key={winery.id}>
              <WineryCard winery={winery} />
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8 flex flex-col gap-6 rounded-none md:rounded-3xl bg-[#f4ece7] px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-500">
            <Wine className="h-4 w-4 text-[#721c24]" aria-hidden />
            ღვინის ტურიზმი და მეპატრონეები
          </p>
          <h2 className="mt-2 font-dejavu-sans font-bold text-2xl leading-snug text-zinc-900 sm:text-[1.7rem]">
            გსურთ თქვენი მარნის დამატება WINEO-ს კატალოგში?
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            გააზიარეთ თქვენი ღვინო, ისტორია და სადეგუსტაციო ტურები ათასობით ღვინის მოყვარულთან.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#721c24] px-5 py-3 text-sm font-medium text-white hover:bg-[#5c151c]"
        >
          მარნის რეგისტრაცია
        </Link>
      </section>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 md:px-0">
        <p className="text-sm text-zinc-500">სულ მოიძებნა {filtered.length} მარანი</p>
        {pageCount > 1 && (
          <nav aria-label="გვერდები" className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-white disabled:opacity-40"
            >
              უკან
            </button>
            {pageItems(safePage, pageCount).map((item, index) =>
              item === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-sm text-zinc-400">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === safePage ? "page" : undefined}
                  className={`h-9 min-w-9 rounded-full px-2 text-sm ${
                    item === safePage ? "bg-[#721c24] font-medium text-white" : "text-zinc-700 hover:bg-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === pageCount}
              className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-white disabled:opacity-40"
            >
              შემდეგ
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
