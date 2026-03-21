import Link from "next/link";
import { getListingsFromApi } from "@/lib/listings";
import { ListingCard } from "@/components/listing";

export async function BuyRentSection() {
  const [buyListings, rentListings] = await Promise.all([
    getListingsFromApi("buy", 5),
    getListingsFromApi("rent", 5),
  ]);

  const buyLatest = buyListings;
  const rentLatest = rentListings;

  return (
    <section
      className="border-b border-zinc-200 bg-white py-10"
      aria-labelledby="buy-rent-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid gap-12">
          {/* Buy */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg nav-font-caps font-semibold wineo-red flex items-center gap-2">
                <svg
                  className="h-5 w-5 wine-red shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                იყიდე
              </h4>
              <Link
                href="/buy"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                ყველა →
              </Link>
            </div>
            <div className="w-full max-w-full overflow-x-auto pb-2 md:overflow-visible">
              {buyLatest.length === 0 ? (
                <p className="text-zinc-500">
                  განცხადებები ჯერ არ გაქვთ.
                </p>
              ) : (
                <div className="flex gap-2 md:grid md:grid-cols-5 md:gap-2">
                  {buyLatest.map((listing) => (
                    <div key={listing.id} className="w-[230px] shrink-0 md:w-auto md:shrink">
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rent */}
          {rentLatest.length > 0 && (
            <>
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg nav-font-caps font-semibold wineo-red flex items-center gap-2">
                    <svg
                      className="h-5 w-5 wine-red shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>{" "}
                    იქირავე
                  </h4>
                  <Link
                    href="/rent"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    ყველა →
                  </Link>
                </div>
                <ul className="grid grid-cols-2 gap-2 md:gap-4">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
