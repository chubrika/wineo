import { getFeaturedListings } from "@/lib/listings";
import { FeaturedListingCard } from "@/components/listing";

export async function FeaturedListings() {
  const listings = await getFeaturedListings(10);

  if (listings.length === 0) return null;

  return (
    <section
      className="border-b border-zinc-200 bg-white py-8 md:py-14 sm:py-18 px-4 md:px-0"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="featured-heading" className="tex-md md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl">
          რეკომენდირებული პროდუქტები
        </h2>
        <div className="w-full max-w-full overflow-x-auto pb-2 md:overflow-visible">
          <ul className="mt-3 md:mt-10 flex gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-5">
            {listings.map((listing) => (
              <li key={listing.id} className="w-[230px] shrink-0 md:w-auto md:shrink">
                <FeaturedListingCard listing={listing} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
