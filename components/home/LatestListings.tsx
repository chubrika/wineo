import Link from "next/link";
import { getLatestListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";

const DEFAULT_PAGE_SIZE = 12;

export async function LatestListings() {
  const { items, total } = await getLatestListings(DEFAULT_PAGE_SIZE, 0);
  const hasMore = total > DEFAULT_PAGE_SIZE;

  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-14 sm:py-18"
      aria-labelledby="latest-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="latest-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Latest Listings
            </h2>
            <p className="mt-2 text-zinc-600">
              Newly added equipment and land, sorted by date.
            </p>
          </div>
          {hasMore && (
            <Link
              href="/listings?sort=latest"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:shrink-0"
            >
              View all ({total}) →
            </Link>
          )}
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <li className="col-span-full text-zinc-500">
              No listings yet. Check back soon.
            </li>
          ) : (
            items.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))
          )}
        </ul>
        {/* Pagination-ready: pass page and render Next/Prev when wiring to URL */}
      </div>
    </section>
  );
}
