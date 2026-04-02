import { API_BASE } from "@/lib/api";
import type { ApiEvent, ApiEventsCalendarResponse, ApiEventsListResponse } from "@/types/event";

const nativeFetch: typeof globalThis.fetch = (...args) => globalThis.fetch(...args);

const fetch: typeof globalThis.fetch = (input, init) =>
  nativeFetch(input, { ...init, credentials: "include" });

export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseEventsListResponse(data: ApiEventsListResponse): { items: ApiEvent[]; total: number } {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  const items = Array.isArray(data.items) ? data.items : [];
  const total = typeof data.total === "number" ? data.total : items.length;
  return { items, total };
}

type NextFetchOpts = RequestInit & { next?: { revalidate?: number } };

export async function fetchEventsCalendar(opts?: NextFetchOpts): Promise<ApiEventsCalendarResponse> {
  const hasRevalidate =
    typeof opts === "object" &&
    opts != null &&
    "next" in opts &&
    typeof (opts as { next?: { revalidate?: number } }).next?.revalidate === "number";

  const res = await fetch(`${API_BASE}/events/calendar`, {
    ...(hasRevalidate ? null : { cache: "no-store" }),
    ...opts,
  });
  const data = (await res.json().catch(() => ({}))) as ApiEventsCalendarResponse & { error?: string };
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data as ApiEventsCalendarResponse;
}

/**
 * GET /events/slug/:slug — public event details by URL slug.
 */
export async function getEventBySlug(slug: string, opts?: NextFetchOpts): Promise<ApiEvent | null> {
  try {
    const normalized = typeof slug === "string" ? slug.trim() : "";
    if (!normalized) return null;

    const hasRevalidate =
      typeof opts === "object" &&
      opts != null &&
      "next" in opts &&
      typeof (opts as { next?: { revalidate?: number } }).next?.revalidate === "number";

    const res = await fetch(`${API_BASE}/events/slug/${encodeURIComponent(normalized)}`, {
      ...(hasRevalidate ? null : { cache: "no-store" }),
      ...opts,
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as ApiEvent & { error?: string };
    if (!data || typeof data !== "object") return null;
    return data as ApiEvent;
  } catch {
    return null;
  }
}

export async function fetchEventsList(params?: {
  date?: string | null;
  page?: number;
  limit?: number;
}): Promise<{ items: ApiEvent[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);
  if (params?.page != null) qs.set("page", String(params.page));
  if (params?.limit != null) qs.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}/events${qs.toString() ? `?${qs.toString()}` : ""}`, {
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as ApiEventsListResponse & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string })?.error || res.statusText);
  return parseEventsListResponse(data as ApiEventsListResponse);
}

