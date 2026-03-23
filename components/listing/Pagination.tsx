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
          className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          წინა
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-400">
          წინა
        </span>
      )}

      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 shadow-sm">
        <span className="text-xs uppercase tracking-wide text-zinc-500">გვერდი</span>
        <span className="font-semibold text-zinc-900">{currentPage}</span>
        <span className="text-zinc-400">/</span>
        <span className="font-medium text-zinc-700">{totalPages}</span>
      </span>

      {nextPage ? (
        <Link
          href={`${pathname}${baseQuery(nextPage)}`}
          className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          შემდეგი
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-400">
          შემდეგი
        </span>
      )}
    </nav>
  );
}
