import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getRegions } from "@/lib/api";
import { buildCategoryTree } from "@/lib/categories";
import { searchListings } from "@/lib/listings";
import {
  parseListingSearchParams,
  DEFAULT_PAGE_SIZE,
  listingBasePath,
} from "@/lib/listing-search";
import {
  ListingPageLayout,
  ListingToolbar,
  ListingGrid,
  Pagination,
} from "@/components/listing";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import {
  buildMetadata,
  buildCanonicalUrl,
  buildProductListJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

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
    return slugs.length > 0 ? slugs : [{ categorySlug: "_" }];
  } catch {
    return [{ categorySlug: "_" }];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const resolved = await searchParams;
  const state = parseListingSearchParams("buy", resolved, categorySlug);
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { title: "Category" };

  const page = state.page ? Number(state.page) : 1;
  const { items, total } = await searchListings({
    type: "buy",
    categorySlug,
    page,
    limit: DEFAULT_PAGE_SIZE,
    priceMin: state.priceMin ? Number(state.priceMin) : undefined,
    priceMax: state.priceMax ? Number(state.priceMax) : undefined,
    regionSlug: state.region,
    sort: state.sort,
    keyword: state.keyword,
    attributeFilters: state.attributeFilters,
  });

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE) || 1;
  const basePath = listingBasePath("buy", categorySlug);
  const description =
    category.description?.trim() ||
    (items.length > 0
      ? `Buy ${category.name.toLowerCase()}. ${items[0].title} and more winemaking equipment in Georgia.`
      : `Buy ${category.name.toLowerCase()}. Winemaking equipment in Georgia.`);

  return buildMetadata({
    title: `${category.name} | ${SITE_NAME}`,
    description,
    path: page <= 1 ? basePath : `${basePath}?page=${String(page)}`,
    keywords: [
      "buy",
      category.name,
      "winemaking equipment",
      "Georgia",
      "wine equipment",
    ],
  });
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
      attributeFilters: state.attributeFilters,
    }),
  ]);

  const categoryTree = buildCategoryTree(categoriesRes);
  const category = categoryBySlug ?? categoriesRes.find(
    (c) => c.active && c.slug === categorySlug
  );
  if (!category) notFound();

  const listUrl =
    state.page && Number(state.page) > 1
      ? `${SITE_URL}${listingBasePath("buy", categorySlug)}?page=${state.page}`
      : buildCanonicalUrl(listingBasePath("buy", categorySlug));

  const productListJsonLd = buildProductListJsonLd({
    listings: items,
    listName: `${category.name} — Buy`,
    listUrl,
    baseUrl: SITE_URL,
    page: state.page ? Number(state.page) : 1,
    totalItems: total,
  });

  return (
    <ListingPageLayout
      type={type}
      categorySlug={categorySlug}
      categoryId={category.id}
      state={state}
      categoryTree={categoryTree}
      regions={regionsRes}
    >
      <JsonLd data={productListJsonLd} />
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
