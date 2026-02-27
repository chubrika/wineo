"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ListingSearchState } from "@/lib/listing-search";
import { buildListingSearchString } from "@/lib/listing-search";

export interface RegionItem {
  slug: string;
  label: string;
}

interface RegionFilterProps {
  state: ListingSearchState;
  /** Regions from backend (e.g. GET /regions). Rendered in filter sidebar. */
  regions?: RegionItem[];
}

export function RegionFilter({ state, regions = [] }: RegionFilterProps) {
  const pathname = usePathname();
  const current = state.region;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
        რეგიონი
      </h2>
      <ul className="space-y-1" role="list">
        {regions.map((region) => {
          const isActive = current === region.slug;
          const q = buildListingSearchString({
            priceMin: state.priceMin,
            priceMax: state.priceMax,
            sort: state.sort,
            page: undefined,
            keyword: state.keyword,
            region: isActive ? undefined : region.slug,
          });
          return (
            <li key={region.slug}>
              <Link
                href={`${pathname}${q}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {region.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
