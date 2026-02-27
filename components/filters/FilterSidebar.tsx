"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ListingType } from "@/types/listing";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingSearchState } from "@/lib/listing-search";
import { buildListingSearchString } from "@/lib/listing-search";
import { CategoryTree } from "./CategoryTree";
import { DynamicFilters } from "./DynamicFilters";
import { PriceFilter } from "./PriceFilter";
import { RegionFilter } from "./RegionFilter";

export interface FilterSidebarProps {
  type: ListingType;
  categorySlug?: string | null;
  /** When set, DynamicFilters loads filters for this category. */
  categoryId?: string | null;
  state: ListingSearchState;
  categoryTree: CategoryTreeNode[];
  /** Regions from backend for region filter */
  regions?: { slug: string; label: string }[];
  /** Optional: for mobile drawer, hide sidebar and show a trigger instead is handled by parent */
  onClearFilters?: () => void;
}

export function FilterSidebar({
  type,
  categorySlug,
  categoryId,
  state,
  categoryTree,
  regions = [],
  onClearFilters,
}: FilterSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const hasActiveFilters =
    state.priceMin ||
    state.priceMax ||
    state.region ||
    state.keyword;

  const clearAll = () => {
    const q = buildListingSearchString({});
    onClearFilters?.();
    router.push(`${pathname}${q}`);
  };

  return (
    <aside
      className="flex flex-col gap-6 bg-white p-4 rounded-lg"
      aria-label="Filter listings"
    >
      <CategoryTree
        type={type}
        tree={categoryTree}
        currentSlug={categorySlug}
      />
      <DynamicFilters
        state={state}
        categorySlug={categorySlug}
        categoryId={categoryId}
      />
      <PriceFilter state={state} />
      <RegionFilter state={state} regions={regions} />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm cursor-pointer font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
        >
          ფილტრის გასუფთავება
        </button>
      )}
    </aside>
  );
}
