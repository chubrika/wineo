import Link from "next/link";
import { getListingsFromApi } from "@/lib/listings";
import { ListingCard } from "@/components/listing";

export async function BuyRentSection() {
  const [buyListings, rentListings] = await Promise.all([
    getListingsFromApi("buy", 4),
    getListingsFromApi("rent", 4),
  ]);

  const buyLatest = buyListings;
  const rentLatest = rentListings;

  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-14 sm:py-18"
      aria-labelledby="buy-rent-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="buy-rent-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          იყიდე vs იქირავე
        </h2>
        <p className="mt-2 text-zinc-600">
          ბოლოს დამატებული განცხადებები.
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {/* Buy */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900">
                ბოლოს დამატებული — იყიდე
              </h3>
              <Link
                href="/buy"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                ყველა →
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {buyLatest.length === 0 ? (
                <li className="col-span-full text-zinc-500">
                  განცხადებები ჯერ არ გაქვთ.
                </li>
              ) : (
                buyLatest.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} />
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Rent */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900">
                ბოლოს დამატებული — იქირავე
              </h3>
              <Link
                href="/rent"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                ყველა →
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {rentLatest.length === 0 ? (
                <li className="col-span-full text-zinc-500">
                  განცხადებები ჯერ არ გაქვთ.
                </li>
              ) : (
                rentLatest.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} />
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
