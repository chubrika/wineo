import type { ListingType } from "@/types/listing";
import type { CategoryTreeNode } from "@/types/category";
import type { ListingSearchState } from "@/lib/listing-search";
import type { ApiRegion } from "@/lib/api";
import { FilterSidebarWithDrawer } from "@/components/filters";

export interface ListingPageLayoutProps {
  type: ListingType;
  categorySlug?: string | null;
  /** When on a category page, pass category id so dynamic filters can be loaded. */
  categoryId?: string | null;
  state: ListingSearchState;
  categoryTree: CategoryTreeNode[];
  /** Regions from backend for region filter */
  regions?: ApiRegion[];
  children: React.ReactNode;
}

/**
 * Two-column layout: sticky filter sidebar (desktop) / filter drawer (mobile) + main content.
 * Use on /buy, /rent, /buy/[categorySlug], /rent/[categorySlug] pages.
 */
export function ListingPageLayout({
  type,
  categorySlug,
  categoryId,
  state,
  categoryTree,
  regions = [],
  children,
}: ListingPageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FilterSidebarWithDrawer
        type={type}
        categorySlug={categorySlug}
        categoryId={categoryId}
        state={state}
        categoryTree={categoryTree}
        regions={regions}
      >
        {children}
      </FilterSidebarWithDrawer>
    </div>
  );
}
