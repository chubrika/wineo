"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventList } from "@/components/events/EventList";
import type { ApiEvent } from "@/types/event";

type Props = {
  countsByDate: Record<string, number>;
  initialItems: ApiEvent[];
  initialTotal: number;
};

function parseSelectedDate(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EventsPageClient({ countsByDate, initialItems, initialTotal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDateStr = searchParams.get("date");

  const selected = useMemo(() => parseSelectedDate(selectedDateStr), [selectedDateStr]);

  const onSelect = (d: Date | undefined) => {
    const qs = new URLSearchParams(Array.from(searchParams.entries()));
    // Any filter change should reset pagination.
    qs.delete("page");
    if (!d) qs.delete("date");
    else qs.set("date", toYmdLocal(d));
    router.push(`/events${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <EventsCalendar countsByDate={countsByDate} selected={selected} onSelect={onSelect} />
      </div>
      <EventList
        initialItems={initialItems}
        initialTotal={initialTotal}
        initialSelectedDate={selectedDateStr}
      />
    </div>
  );
}

