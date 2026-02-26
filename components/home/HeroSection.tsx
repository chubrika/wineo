"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";
import { REGIONS } from "@/constants/regions";
import type { ListingType } from "@/types/listing";

const HERO_PLACEHOLDER = "/next.svg";

export function HeroSection() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");

  const searchHref = listingType === "buy" ? "/buy" : "/rent";
  const params = new URLSearchParams();
  if (keyword.trim()) params.set("q", keyword.trim());
  if (category) params.set("category", category);
  if (region) params.set("region", region);
  const query = params.toString();
  const fullHref = query ? `${searchHref}?${query}` : searchHref;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(fullHref);
  }

  return (
    <section
      className="relative min-h-[520px] overflow-hidden bg-zinc-100 text-zinc-900 md:min-h-[580px]"
      aria-label="Hero"
    >
      {/* Slider: single slide placeholder */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${HERO_PLACEHOLDER})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-zinc-50/95 to-zinc-100" />
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 md:min-h-[580px]">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            განცხადებების ძებნა და დამატება
          </h1>
          <p className="mt-4 text-lg text-zinc-600 sm:text-xl">
          იყიდეთ ან იქირავეთ ბოთლები, კასრები, დანადგარები და ვენახის მიწები. დაუკავშირდით მყიდველებსა და დამქირავებლებს საქართველოს რეგიონებში.          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buy"
              className="inline-flex items-center justify-center rounded-lg bg-[#8a052d] px-5 py-2.5 text-[20px] font-semibold normal-font text-white transition hover:bg-[#6d0423]"
            >
              განცხადებები
            </Link>
            <Link
              href="/listing/add"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-[20px] font-semibold normal-font text-[#8a052d] transition hover:bg-zinc-50"
            >
              დამატება
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-10">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
            role="search"
          >
            <label className="flex-1 min-w-[180px]">
              <span className="sr-only">ძებნა</span>
              <input
                type="search"
                name="q"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ძებნა..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                aria-label="Search by keyword"
              />
            </label>
            <label className="w-full sm:w-auto min-w-[160px]">
              <span className="sr-only">კატეგორია</span>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-500 sm:w-[180px]"
                aria-label="Category"
              >
                <option value="">ყველა კატეგორია</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2" role="group" aria-label="Listing type">
              <button
                type="button"
                onClick={() => setListingType("buy")}
                className={`rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium transition ${
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
                className={`rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium transition ${
                  listingType === "rent"
                    ? "bg-[#8a052d] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                იქირავე
              </button>
            </div>
            <label className="w-full sm:w-auto min-w-[140px]">
              <span className="sr-only">რეგიონი</span>
              <select
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-500 sm:w-[130px]"
                aria-label="Region"
              >
                <option value="">ყველა</option>
                {REGIONS.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg cursor-pointer bg-[#8a052d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d0423]"
            >
              ძებნა
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
