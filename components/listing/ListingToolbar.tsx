"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ListingSortOption } from "@/types/listing";
import { buildListingSearchString } from "@/lib/listing-search";
import { SORT_OPTIONS } from "@/constants/sort";
import type { ListingSearchState } from "@/lib/listing-search";

interface ListingToolbarProps {
  total: number;
  state: ListingSearchState;
  pageSize: number;
}

export function ListingToolbar({ total, state, pageSize }: ListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const start = total === 0 ? 0 : (Number(state.page) || 1) * pageSize - pageSize + 1;
  const end = Math.min((Number(state.page) || 1) * pageSize, total);
  const currentSort = state.sort ?? "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value as ListingSortOption;
    const q = buildListingSearchString({
      priceMin: state.priceMin,
      priceMax: state.priceMax,
      region: state.region,
      sort,
      page: undefined,
      keyword: state.keyword,
    });
    router.push(`${pathname}${q}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600" aria-live="polite">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            <span className="font-medium text-lg text-zinc-900">{total} </span> განცხადება
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="listing-sort" className="text-sm font-medium text-zinc-700">
          დალაგება
        </label>
        <select
          id="listing-sort"
          value={currentSort}
          onChange={handleSortChange}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          aria-label="Sort results by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
