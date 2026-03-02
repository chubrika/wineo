"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListingSearchState } from "@/lib/listing-search";
import { getFiltersByCategoryId, type ApiFilter } from "@/lib/api";

/**
 * Category-specific dynamic filters (e.g. capacity, material).
 * Loads filters from GET /filters/by-category/:categoryId when a category is selected.
 */
interface DynamicFiltersProps {
  state: ListingSearchState;
  categorySlug?: string | null;
  /** When set, filters are fetched for this category and rendered. */
  categoryId?: string | null;
  /** Optional: facet counts from API/ElasticSearch for selected category (future use). */
  facets?: Record<string, { value: string; count: number }[]>;
}

/** Reserved query keys (not attribute filters). Must match listing-search RESERVED_SEARCH_KEYS. */
const RESERVED_KEYS = new Set(["priceMin", "priceMax", "region", "sort", "page", "q"]);

/** URL structure: /:categorySlug?country=italy&brand=brand-2&color=yellow (bare slugs, no prefix). */

/** URL value = option label (filterSlug=optionLabel). Checkbox value and URL param use the label as-is. */
function getOptionSlug(optionLabel: string, filterSlug: string, index: number): string {
  const label = typeof optionLabel === "string" ? optionLabel.trim() : "";
  return label || `${filterSlug}-${index}`;
}

/** Read attribute filter params from URL using bare slugs (e.g. country=italy or country=italy&country=georgia).
 * Uses lowercase for URL keys so ?brendi=2 and ?Brendi=2 both work. Returns an entry for every filterSlug so merging never drops a filter. */
function getAttrParams(
  searchParams: URLSearchParams,
  filterSlugs: string[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const slug of filterSlugs) {
    if (RESERVED_KEYS.has(slug.toLowerCase())) continue;
    const urlKey = slug.toLowerCase();
    const all = searchParams.getAll(urlKey);
    const values = all.length ? all : (searchParams.get(urlKey) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    out[slug] = values.length ? values : [];
  }
  return out;
}

function buildUrlWithAttrs(
  pathname: string,
  state: ListingSearchState,
  attrFilters: Record<string, string[]>
): string {
  const q = new URLSearchParams();
  if (state.priceMin) q.set("priceMin", state.priceMin);
  if (state.priceMax) q.set("priceMax", state.priceMax);
  if (state.region) q.set("region", state.region);
  if (state.sort) q.set("sort", state.sort);
  if (state.page && Number(state.page) > 1) q.set("page", state.page);
  if (state.keyword) q.set("q", state.keyword);
  Object.entries(attrFilters).forEach(([slug, values]) => {
    const v = values.filter(Boolean);
    const key = slug.toLowerCase();
    if (v.length === 1) {
      q.set(key, v[0]!);
    } else if (v.length > 1) {
      v.forEach((val) => q.append(key, val));
    }
  });
  const s = q.toString();
  return s ? `${pathname}?${s}` : pathname;
}

export function DynamicFilters({
  state,
  categorySlug,
  categoryId,
  facets,
}: DynamicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ApiFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attrParams = getAttrParams(searchParams, filters.map((f) => f.slug));

  useEffect(() => {
    if (!categoryId) {
      const tid = setTimeout(() => {
        setFilters([]);
        setError(null);
      }, 0);
      return () => clearTimeout(tid);
    }
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }
      })
      .then(() => getFiltersByCategoryId(categoryId))
      .then((list) => {
        if (!cancelled) setFilters(list);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load filters");
          setFilters([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const setAttr = useCallback(
    (filterSlug: string, value: string) => {
      const next = { ...attrParams };
      if (value) {
        next[filterSlug] = [value];
      } else {
        delete next[filterSlug];
      }
      const url = buildUrlWithAttrs(pathname, state, next);
      router.push(url);
    },
    [pathname, state, attrParams, router]
  );

  const setAttrMulti = useCallback(
    (filterSlug: string, values: string[]) => {
      const next = { ...attrParams };
      const filtered = values.filter(Boolean);
      if (filtered.length > 0) {
        next[filterSlug] = filtered;
      } else {
        delete next[filterSlug];
      }
      const url = buildUrlWithAttrs(pathname, state, next);
      router.push(url);
    },
    [pathname, state, attrParams, router]
  );

  if (!categorySlug && !categoryId && (!facets || Object.keys(facets || {}).length === 0)) {
    return null;
  }

  if (!categoryId) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
          ფილტრები
        </h2>
        <p className="text-sm text-zinc-500">იტვირთება…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
          ფილტრები
        </h2>
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
        ფილტრები
      </h2>
      <div className="space-y-4">
        {filters.map((filter) => (
          <DynamicFilterControl
            key={filter.id}
            filter={filter}
            value={attrParams[filter.slug] ?? []}
            valueSingle={attrParams[filter.slug]?.[0] ?? ""}
            onChange={(value) => setAttr(filter.slug, value)}
            onChangeMulti={(values) => setAttrMulti(filter.slug, values)}
          />
        ))}
      </div>
    </div>
  );
}

interface DynamicFilterControlProps {
  filter: ApiFilter;
  /** Multiple selected values (for select-as-checkboxes). */
  value: string[];
  /** Single value (for other control types). */
  valueSingle: string;
  onChange: (value: string) => void;
  onChangeMulti: (values: string[]) => void;
}

function DynamicFilterControl({
  filter,
  value,
  valueSingle,
  onChange,
  onChangeMulti,
}: DynamicFilterControlProps) {
  const label = filter.unit ? `${filter.name} (${filter.unit})` : filter.name;
  const id = `filter-${filter.slug}`;

  if (filter.type === "select" && Array.isArray(filter.options) && filter.options.length > 0) {
    // URL slug = checkbox value (slug from option label, e.g. "1" for "ბრენდი-1")
    const selectedSet = new Set(value);
    const toggle = (optSlug: string) => {
      const next = selectedSet.has(optSlug)
        ? value.filter((v) => v !== optSlug)
        : [...value, optSlug];
      onChangeMulti(next);
    };
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-zinc-900">{label}</span>
        <div className="space-y-2">
          {filter.options.map((opt, index) => {
            const optSlug = getOptionSlug(opt, filter.slug, index);
            const optId = `${id}-${optSlug}`;
            const checked = selectedSet.has(optSlug);
            return (
              <div key={`${id}-${index}`} className="flex items-center gap-2">
                <input
                  id={optId}
                  type="checkbox"
                  value={optSlug}
                  checked={checked}
                  onChange={() => toggle(optSlug)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                <label
                  htmlFor={optId}
                  className="cursor-pointer text-sm text-zinc-700 hover:text-zinc-900"
                >
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (filter.type === "number" || filter.type === "text") {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
        <input
          id={id}
          type={filter.type === "number" ? "number" : "text"}
          value={valueSingle}
          onChange={(e) => onChange(e.target.value)}
          placeholder={filter.type === "number" ? "0" : ""}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>
    );
  }

  if (filter.type === "checkbox") {
    const checked = valueSingle === "true" || valueSingle === "1";
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked ? "1" : "")}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
        />
        <label htmlFor={id} className="text-sm font-medium text-zinc-900">
          {label}
        </label>
      </div>
    );
  }

  if (filter.type === "range") {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
        <input
          id={id}
          type="text"
          value={valueSingle}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 0-100"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>
    );
  }

  return null;
}
