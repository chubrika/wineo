"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Check, ArrowUpDownIcon } from "lucide-react";
import type { ListingSortOption } from "@/types/listing";
import { buildListingSearchString } from "@/lib/listing-search";
import { SORT_OPTIONS } from "@/constants/sort";
import type { ListingSearchState } from "@/lib/listing-search";

interface ListingToolbarProps {
  total: number;
  state: ListingSearchState;
  pageSize: number;
}

export function ListingToolbar({ total, state }: ListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const currentSort = state.sort ?? "newest";
  const selectedSort = SORT_OPTIONS.find((opt) => opt.value === currentSort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sortMenuOpen]);

  const handleSortChange = (sort: ListingSortOption) => {
    const q = buildListingSearchString({
      priceMin: state.priceMin,
      priceMax: state.priceMax,
      region: state.region,
      sort,
      page: undefined,
      keyword: state.keyword,
    });
    setSortMenuOpen(false);
    router.push(`${pathname}${q}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-zinc-600" aria-live="polite">
        {total === 0 ? (
          "არ არის მონაცემები"
        ) : (
          <>
            <span className="font-medium text-lg text-zinc-900">{total} </span> განცხადება
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <div ref={sortMenuRef} className="relative">
          <button
            id="listing-sort-button"
            type="button"
            onClick={() => setSortMenuOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSortMenuOpen(false);
            }}
            className="inline-flex items-center justify-between rounded-xl cursor-pointer px-3.5 py-2.5 text-sm font-medium text-zinc-900  focus:outline-none"
            aria-label="Sort results by"
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}
          >
             <ArrowUpDownIcon className="h-4 w-4 mr-2 text-zinc-700 transition-transform" aria-hidden />
            <span>{selectedSort.label}</span>
          </button>

          {sortMenuOpen && (
            <div
              className="absolute right-0 z-20 mt-2 w-full min-w-[220px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg"
              role="listbox"
              aria-label="Sort options"
            >
              {SORT_OPTIONS.map((opt) => {
                const isActive = opt.value === currentSort;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-100 font-medium text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span>{opt.label}</span>
                    {isActive ? <Check className="h-4 w-4 text-zinc-600" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
