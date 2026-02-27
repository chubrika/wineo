import type { Metadata } from "next";
import { getCategories, getRegions } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import { searchListings } from "@/lib/listings";
import {
  parseListingSearchParams,
  DEFAULT_PAGE_SIZE,
} from "@/lib/listing-search";
import {
  ListingPageLayout,
  ListingToolbar,
  ListingGrid,
  Pagination,
} from "@/components/listing";

export const metadata: Metadata = {
  title: "იყიდე პროდუქტები",
  description:
    "პროდუქტების მოძიება და ყიდვა. კრუსერები, პრესები, ფერმენტაციის ტანკები, ბარელები და ა.შ.",
  openGraph: {
    title: "იყიდე პროდუქტები",
    description:
      "პროდუქტების მოძიება და ყიდვა. კრუსერები, პრესები, ფერმენტაციის ტანკები, ბარელები და ა.შ.",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BuyPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const type = "buy" as const;
  const state = parseListingSearchParams(type, resolved);

  const [categoriesRes, regionsRes, { items, total }] = await Promise.all([
    getCategories(),
    getRegions(),
    searchListings({
      type,
      categorySlug: state.categorySlug,
      priceMin: state.priceMin ? Number(state.priceMin) : undefined,
      priceMax: state.priceMax ? Number(state.priceMax) : undefined,
      regionSlug: state.region,
      sort: state.sort,
      page: state.page ? Number(state.page) : 1,
      limit: DEFAULT_PAGE_SIZE,
      keyword: state.keyword,
    }),
  ]);

  const categoryTree = buildCategoryTree(categoriesRes);

  return (
    <ListingPageLayout
      type={type}
      state={state}
      categoryTree={categoryTree}
      regions={regionsRes}
    >
      <div className="space-y-6">
        <ListingToolbar
          total={total}
          state={state}
          pageSize={DEFAULT_PAGE_SIZE}
        />
        <ListingGrid
          listings={items}
          emptyMessage="პროდუქტები ჯერ არ არის. მოგვიანებით დაემატება."
        />
        <Pagination
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          state={state}
        />
      </div>
    </ListingPageLayout>
  );
}
