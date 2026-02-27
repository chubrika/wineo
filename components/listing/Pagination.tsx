"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildListingSearchString } from "@/lib/listing-search";
import type { ListingSearchState } from "@/lib/listing-search";

interface PaginationProps {
  total: number;
  pageSize: number;
  state: ListingSearchState;
}

export function Pagination({ total, pageSize, state }: PaginationProps) {
  const pathname = usePathname();
  const currentPage = Number(state.page) || 1;
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (totalPages <= 1) return null;

  const baseQuery = (page?: number) =>
    buildListingSearchString({
      priceMin: state.priceMin,
      priceMax: state.priceMax,
      region: state.region,
      sort: state.sort,
      keyword: state.keyword,
      page,
    });

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-8"
    >
      {prevPage ? (
        <Link
          href={`${pathname}${baseQuery(prevPage)}`}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm text-zinc-400">
          Previous
        </span>
      )}

      <span className="px-2 text-sm text-zinc-600">
        Page <span className="font-medium">{currentPage}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </span>

      {nextPage ? (
        <Link
          href={`${pathname}${baseQuery(nextPage)}`}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm text-zinc-400">
          Next
        </span>
      )}
    </nav>
  );
}
