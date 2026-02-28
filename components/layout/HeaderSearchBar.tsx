"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      <input
        type="search"
        name="q"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="ძებნა..."
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 normal-font"
        aria-label="ძებნა"
      />
    </form>
  );
}
