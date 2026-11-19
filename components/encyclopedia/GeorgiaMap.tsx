"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { MAP_LABELS, mapSlugForRegion } from "@/lib/encyclopedia";
import type { ApiRegion } from "@/lib/api";

type Tooltip = { x: number; y: number; label: string };

type GeorgiaMapProps = {
  regions: ApiRegion[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

function labelForSlug(slug: string, regions: ApiRegion[]): string {
  const match = regions.find((region) => mapSlugForRegion(region) === slug);
  return match?.label || MAP_LABELS[slug] || slug;
}

export function GeorgiaMap({ regions, selectedSlug, onSelect }: GeorgiaMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/georgia.svg")
      .then((res) => res.text())
      .then((text) => {
        if (cancelled || !hostRef.current) return;
        const start = text.indexOf("<svg");
        hostRef.current.innerHTML = start >= 0 ? text.slice(start) : text;
        const svg = hostRef.current.querySelector("svg");
        svg?.setAttribute("role", "img");
        svg?.setAttribute("aria-label", "საქართველოს ღვინის რეგიონები");
        svg?.removeAttribute("width");
        svg?.removeAttribute("height");
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = hostRef.current;
    if (!root) return;
    root.querySelectorAll<SVGElement>("[data-slug]").forEach((node) => {
      node.classList.toggle("is-active", node.getAttribute("data-slug") === selectedSlug);
    });
  }, [selectedSlug, ready]);

  function slugFrom(event: MouseEvent): string | null {
    const target = event.target as Element | null;
    return target?.closest?.("[data-slug]")?.getAttribute("data-slug") ?? null;
  }

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const slug = slugFrom(event);
    if (!slug || !hostRef.current) {
      setTooltip(null);
      return;
    }
    const rect = hostRef.current.getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: labelForSlug(slug, regions),
    });
  }

  function onClick(event: MouseEvent<HTMLDivElement>) {
    const slug = slugFrom(event);
    if (slug) onSelect(slug);
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={hostRef}
        className="georgia-map overflow-hidden rounded-lg border border-zinc-200 bg-[#f7f4ea]"
        onMouseMove={onMove}
        onMouseLeave={() => setTooltip(null)}
        onClick={onClick}
      />
      {!ready && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">იტვირთება...</p>
      )}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white shadow"
          style={{ left: tooltip.x, top: Math.max(8, tooltip.y - 8) }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
