import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getRegions } from "@/lib/api";
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

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Always fetch fresh category and product data on each request (no static cache). */
export const dynamic = "force-dynamic";

/** Allow any category slug at request time; do not 404 for slugs not in generateStaticParams. */
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const list = await getCategories();
    const slugs = list.filter((c) => c.active).map((c) => ({ categorySlug: c.slug }));
    // Return at least one param so build-time validation passes when API is empty or fails.
    return slugs.length > 0 ? slugs : [{ categorySlug: "_" }];
  } catch {
    return [{ categorySlug: "_" }];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { title: "Category" };
  return {
    title: `${category.name} — Buy | wineo.ge`,
    description: `Buy ${category.name.toLowerCase()}. Winemaking equipment in Georgia.`,
    openGraph: {
      title: `${category.name} — Buy`,
      description: `Buy ${category.name.toLowerCase()}. Winemaking equipment.`,
    },
  };
}

export default async function BuyCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug } = await params;
  const resolved = await searchParams;
  const type = "buy" as const;
  const state = parseListingSearchParams(type, resolved, categorySlug);

  const [categoriesRes, categoryBySlug, regionsRes, { items, total }] = await Promise.all([
    getCategories(),
    getCategoryBySlug(categorySlug),
    getRegions(),
    searchListings({
      type,
      categorySlug,
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
  const category = categoryBySlug ?? categoriesRes.find(
    (c) => c.active && c.slug === categorySlug
  );
  if (!category) notFound();

  return (
    <ListingPageLayout
      type={type}
      categorySlug={categorySlug}
      categoryId={category.id}
      state={state}
      categoryTree={categoryTree}
      regions={regionsRes}
    >
      <div className="space-y-6">
        <header className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {category.name}
          </h1>
        </header>
        <ListingToolbar
          total={total}
          state={state}
          pageSize={DEFAULT_PAGE_SIZE}
        />
        <ListingGrid
          listings={items}
          emptyMessage="No listings in this category yet."
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
