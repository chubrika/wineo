"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ListingSearchState } from "@/lib/listing-search";
import { buildListingSearchString } from "@/lib/listing-search";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface PriceFilterProps {
  state: ListingSearchState;
  /** Called when user applies (navigates). Optional for controlled usage. */
  onApply?: (priceMin: string, priceMax: string) => void;
}

export function PriceFilter({ state, onApply }: PriceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [min, setMin] = useState(state.priceMin ?? "");
  const [max, setMax] = useState(state.priceMax ?? "10000");
  const PRICE_MAX = 100000;

  const minNum = useMemo(() => {
    const n = Number(min);
    return Number.isFinite(n) ? n : NaN;
  }, [min]);
  const maxNum = useMemo(() => {
    const n = Number(max);
    return Number.isFinite(n) ? n : NaN;
  }, [max]);

  const sliderMax = PRICE_MAX;

  const sliderValue = useMemo((): [number, number] => {
    const a = Number.isFinite(minNum) ? Math.min(sliderMax, Math.max(0, minNum)) : 0;
    const b = Number.isFinite(maxNum) ? Math.min(sliderMax, Math.max(0, maxNum)) : sliderMax;
    return a <= b ? [a, b] : [b, a];
  }, [minNum, maxNum, sliderMax]);

  const apply = useCallback(() => {
    const normalizedMin = min.trim() ? String(Math.min(sliderMax, Math.max(0, Number(min)))) : "";
    const normalizedMax = max.trim() ? String(Math.min(sliderMax, Math.max(0, Number(max)))) : "";
    const a = normalizedMin ? Number(normalizedMin) : NaN;
    const b = normalizedMax ? Number(normalizedMax) : NaN;
    const shouldSwap = Number.isFinite(a) && Number.isFinite(b) && a > b;
    const priceMin = shouldSwap ? normalizedMax : normalizedMin;
    const priceMax = shouldSwap ? normalizedMin : normalizedMax;

    const q = buildListingSearchString({
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      region: state.region,
      sort: state.sort,
      page: undefined,
      keyword: state.keyword,
    });
    if (priceMin !== min) setMin(priceMin);
    if (priceMax !== max) setMax(priceMax);
    onApply?.(priceMin, priceMax);
    router.push(`${pathname}${q}`);
  }, [state, min, max, pathname, router, onApply, sliderMax]);

  const clear = useCallback(() => {
    setMin("");
    setMax("");
    const q = buildListingSearchString({
      priceMin: undefined,
      priceMax: undefined,
      region: state.region,
      sort: state.sort,
      page: undefined,
      keyword: state.keyword,
    });
    router.push(`${pathname}${q}`);
  }, [state, pathname, router]);

  const hasValue = min !== "" || max !== "";

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
        ფასი
      </h2>
      <div className="flex flex-col gap-2">
        <div className="px-1 pt-2">
          <Slider
            range
            min={0}
            max={sliderMax}
            value={sliderValue}
            allowCross={false}
            railStyle={{ backgroundColor: "#e4e4e7", height: 6 }}
            trackStyle={[{ backgroundColor: "var(--wineo-red)", height: 6 }]}
            handleStyle={[
              {
                width: 18,
                height: 18,
                marginTop: -6,
                backgroundColor: "#ffffff",
                border: "2px solid var(--wineo-red)",
                opacity: 1,
                boxShadow: "0 0 0 3px rgba(138, 5, 45, 0.15)",
              },
              {
                width: 18,
                height: 18,
                marginTop: -6,
                backgroundColor: "#ffffff",
                border: "2px solid var(--wineo-red)",
                opacity: 1,
                boxShadow: "0 0 0 3px rgba(138, 5, 45, 0.15)",
              },
            ]}
            onChange={(value) => {
              const v = Array.isArray(value) ? value : [0, 0];
              const nextMin = Math.min(sliderMax, Math.max(0, Math.floor(v[0] ?? 0)));
              const nextMax = Math.min(sliderMax, Math.max(0, Math.floor(v[1] ?? 0)));
              setMin(String(nextMin));
              setMax(String(nextMax));
            }}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>0</span>
            <span>{sliderMax}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="price-min" className="sr-only">
            მინიმალური ფასი
          </label>
          <input
            id="price-min"
            type="number"
            min={0}
            step={1}
            placeholder="დან"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <span className="text-zinc-400">–</span>
          <label htmlFor="price-max" className="sr-only">
            Maximum price
          </label>
          <input
            id="price-max"
            type="number"
            min={0}
            step={1}
            placeholder="მდე"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={apply}
            className="rounded-lg cursor-pointer border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-gray-300"
          >
            ჩასმა
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={clear}
              className="rounded-lg cursor-pointer border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-gray-300"
            >
              წაშლა
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
