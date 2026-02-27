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

/** URL param prefix for attribute filters: attr_<filterSlug>=<value> (repeated for multiple). */
const ATTR_PREFIX = "attr_";

function getAttrParams(searchParams: URLSearchParams): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  searchParams.forEach((_, key) => {
    if (key.startsWith(ATTR_PREFIX)) {
      const slug = key.slice(ATTR_PREFIX.length);
      if (slug && !(slug in out)) {
        out[slug] = searchParams.getAll(key);
      }
    }
  });
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
    values.filter(Boolean).forEach((value) => q.append(`${ATTR_PREFIX}${slug}`, value));
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

  const attrParams = getAttrParams(searchParams);

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
    const selectedSet = new Set(value);
    const toggle = (opt: string) => {
      const next = selectedSet.has(opt)
        ? value.filter((v) => v !== opt)
        : [...value, opt];
      onChangeMulti(next);
    };
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-zinc-900">{label}</span>
        <div className="space-y-2">
          {filter.options.map((opt) => {
            const optId = `${id}-${opt.replace(/\s+/g, "-")}`;
            const checked = selectedSet.has(opt);
            return (
              <div key={opt} className="flex items-center gap-2">
                <input
                  id={optId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt)}
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
