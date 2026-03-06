"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { fetchEventsList } from "@/lib/events-api";
import type { ApiEvent } from "@/types/event";

type Props = {
  initialItems: ApiEvent[];
  initialTotal: number;
  initialSelectedDate?: string | null;
};

const PAGE_SIZE = 10;

export function EventList({ initialItems, initialTotal, initialSelectedDate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedDate = searchParams.get("date") ?? initialSelectedDate ?? "";
  const pageParam = searchParams.get("page");
  const page = useMemo(() => {
    const n = Number.parseInt(pageParam ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [pageParam]);

  const [items, setItems] = useState<ApiEvent[]>(() => (page === 1 ? initialItems : []));
  const [total, setTotal] = useState<number>(() => (page === 1 ? initialTotal : 0));
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)), [total]);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      // Resetting state synchronously inside an effect is discouraged; do it asynchronously.
      Promise.resolve().then(() => {
        if (cancelled) return;
        setError(null);
      });
      fetchEventsList({ date: selectedDate || null, page, limit: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setItems([]);
          setTotal(0);
          setError(e instanceof Error ? e.message : "ღონისძიებები ვერ ჩაიტვირთა");
        });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, page]);

  const goToPage = (next: number) => {
    const p = Math.max(1, Math.min(next, totalPages));
    if (p === page) return;
    const qs = new URLSearchParams(Array.from(searchParams.entries()));
    if (p <= 1) qs.delete("page");
    else qs.set("page", String(p));
    router.push(`/events${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const clearDate = () => {
    const qs = new URLSearchParams(Array.from(searchParams.entries()));
    qs.delete("date");
    qs.delete("page");
    router.push(`/events${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-900">ღონისძიებები</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {selectedDate ? (
              <>
               დაგეგმილი ღონისძიებები <span className="font-medium text-zinc-700">{selectedDate}</span>
              </>
            ) : (
              "ყველა დაგეგმილი ღონისძიება"
            )}
          </p>
        </div>
        {selectedDate ? (
          <button
            type="button"
            onClick={clearDate}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            გასუფთავება
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200">
              <div className="aspect-[16/9] animate-pulse bg-zinc-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>

          {total > PAGE_SIZE ? (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Page {page} of {totalPages} • {total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900">No events found</p>
          <p className="mt-1 text-sm text-zinc-600">
            {selectedDate ? "Try another date." : "Please check back soon."}
          </p>
        </div>
      )}
    </div>
  );
}

