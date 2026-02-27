"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ListingSearchState } from "@/lib/listing-search";
import { buildListingSearchString } from "@/lib/listing-search";

interface PriceFilterProps {
  state: ListingSearchState;
  /** Called when user applies (navigates). Optional for controlled usage. */
  onApply?: (priceMin: string, priceMax: string) => void;
}

export function PriceFilter({ state, onApply }: PriceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [min, setMin] = useState(state.priceMin ?? "");
  const [max, setMax] = useState(state.priceMax ?? "");

  const apply = useCallback(() => {
    const q = buildListingSearchString({
      priceMin: min || undefined,
      priceMax: max || undefined,
      region: state.region,
      sort: state.sort,
      page: undefined,
      keyword: state.keyword,
    });
    onApply?.(min, max);
    router.push(`${pathname}${q}`);
  }, [state, min, max, pathname, router, onApply]);

  const clear = useCallback(() => {
    setMin("");
    setMax("");
    const q = buildListingSearchString({
      priceMin: undefined,
      priceMax: undefined,
      region: state.region,
      sort: state.sort,
      page: undefined,
      keyword: state.keyword,
    });
    router.push(`${pathname}${q}`);
  }, [state, pathname, router]);

  const hasValue = min !== "" || max !== "";

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
        ფასი
      </h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="price-min" className="sr-only">
            მინიმალური ფასი
          </label>
          <input
            id="price-min"
            type="number"
            min={0}
            step={1}
            placeholder="დან"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <span className="text-zinc-400">–</span>
          <label htmlFor="price-max" className="sr-only">
            Maximum price
          </label>
          <input
            id="price-max"
            type="number"
            min={0}
            step={1}
            placeholder="მდე"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={apply}
            className="rounded-lg cursor-pointer border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-gray-300"
          >
            ჩასმა
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={clear}
              className="rounded-lg cursor-pointer border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-gray-300"
            >
              წაშლა
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
