"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ApiRegion } from "@/lib/api";
import type { ListingType } from "@/types/listing";
import { ChevronRightIcon } from "lucide-react";

export function RegionSection({ regions }: { regions: ApiRegion[] }) {
  const [listingType, setListingType] = useState<ListingType>("buy");
  const featuredRegions = useMemo(
    () =>
      [...regions]
        .sort(
          (a, b) =>
            (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER),
        )
        .slice(0, 5),
    [regions],
  );
  const [selectedRegionSlug, setSelectedRegionSlug] = useState(featuredRegions[0]?.slug ?? "");

  const baseHref = listingType === "buy" ? "/buy" : "/rent";
  const selectedRegion =
    featuredRegions.find((region) => region.slug === selectedRegionSlug) ?? featuredRegions[0];

  return (
    <section
      className="border-b border-zinc-200 py-8 md:py-14 sm:py-18 px-4 md:px-0"
      aria-labelledby="regions-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h2
            id="regions-heading"
            className="text-md md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl"
          >
            რეგიონებით ძებნა
          </h2>

          <div
            className="mt-4 md:mt-6 flex items-center gap-2"
            role="group"
            aria-label="Listing type"
          >
            <button
              type="button"
              onClick={() => setListingType("buy")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                listingType === "buy"
                  ? "bg-[#8a052d] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              იყიდე
            </button>
            <button
              type="button"
              onClick={() => setListingType("rent")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                listingType === "rent"
                  ? "bg-[#8a052d] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              იქირავე
            </button>
          </div>
        </div>

        {featuredRegions.length > 0 && selectedRegion && (
          <div className="mt-6 md:mt-8 grid gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">
            <div className="relative bg-white p-3 rounded-lg border border-zinc-200 shadow-lg">
              <div
                className="min-h-[360px] w-full bg-cover bg-center sm:min-h-[420px]"
                style={
                  selectedRegion.image
                    ? { backgroundImage: `url("${selectedRegion.image}")` }
                    : undefined
                }
                aria-label={selectedRegion.label}
                role="img"
              />
              <div className="absolute bottom-[-20px] right-0 max-w-full md:right-[-20px] max-w-[100%] md:max-w-[50%] rounded-sm bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
                  {selectedRegion.label}
                </h3>
                {selectedRegion.shortDesc ? (
                  <p className="mt-2 text-xs italic text-zinc-600">
                    &quot;{selectedRegion.shortDesc}&quot;
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-zinc-700 text-sm whitespace-pre-line">
                {selectedRegion.description ||
                  "აღწერა დროებით არ არის ხელმისაწვდომი."}
              </p>

              <ul className="mt-6 space-y-3">
                {featuredRegions.map((region) => {
                  const isActive = region.slug === selectedRegion.slug;
                  const href = `${baseHref}?region=${encodeURIComponent(region.slug)}`;
                  return (
                    <li key={region.slug}>
                      <Link
                        href={href}
                        onMouseEnter={() => setSelectedRegionSlug(region.slug)}
                        onFocus={() => setSelectedRegionSlug(region.slug)}
                        className={`w-full cursor-pointer rounded-md flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition sm:text-base ${
                          isActive
                            ? " border-l-3 border-l-[#8a052d]  bg-white"
                            : "border-zinc-200 bg-[#fbfcff]  text-zinc-700 hover:border-white hover:bg-white"
                        }`}
                      >
                        {region.largeTitle || region.label}
                        <ChevronRightIcon
                          className="h-5 w-5 shrink-0 text-zinc-400"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`${baseHref}?region=${encodeURIComponent(selectedRegion.slug)}`}
                className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-[#8a052d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#740426] active:bg-[#5f031f]"
              >
                განცხადებების ნახვა
              </Link>
            </div>
          </div>
        )}
        {featuredRegions.length === 0 && (
          <p className="mt-8 text-zinc-500">რეგიონები ვერ მოიძებნა.</p>
        )}
      </div>
    </section>
  );
}
