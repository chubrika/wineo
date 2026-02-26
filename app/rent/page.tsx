import type { Metadata } from "next";
import { getListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "Rent Winemaking Equipment",
  description:
    "Rent winemaking equipment for harvest and production: tanks, presses, barrel racks, and more. Flexible rental terms for vineyards and home winemakers.",
  openGraph: {
    title: "Rent Winemaking Equipment",
    description:
      "Rent winemaking equipment. Tanks, presses, barrel racks. Flexible terms.",
  },
};

export default async function RentPage() {
  const listings = await getListings("rent");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section aria-label="Rent listings" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No equipment for rent at the moment. Check back soon.
          </p>
        ) : (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        )}
      </section>
    </div>
  );
}
