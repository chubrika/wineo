"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { buildListingSearchString } from "@/lib/listing-search";

export function HeaderSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const queryString = buildListingSearchString({
      keyword: keyword.trim() || undefined,
    });
    router.push(`/buy${queryString}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex flex-1 min-w-0 max-w-sm">
      <div className="relative w-full">
        <input
          type="search"
          name="q"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="ძებნა"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 placeholder-zinc-500  focus:outline-none normal-font"
          aria-label="ძებნა"
        />
        <button
          type="submit"
          className="absolute  cursor-pointer right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-700 focus:outline-none"
          aria-label="ძიება"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
