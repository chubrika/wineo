import { getFeaturedListings } from "@/lib/listings";
import { FeaturedListingCard } from "@/components/listing";

export async function FeaturedListings() {
  const listings = await getFeaturedListings(6);

  if (listings.length === 0) return null;

  return (
    <section
      className="border-b border-zinc-200 bg-white py-14 sm:py-18"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          რეკომენდირული პროდუქტები
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <FeaturedListingCard listing={listing} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
