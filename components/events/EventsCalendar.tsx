"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format } from "date-fns";

type Props = {
  /** Map YYYY-MM-DD -> count */
  countsByDate: Record<string, number>;
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
};

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EventsCalendar({ countsByDate, selected, onSelect }: Props) {
  const [month, setMonth] = useState<Date>(() => selected ?? new Date());

  const countsForMonth = useMemo(() => {
    // Keep as-is; lookup is O(1) per day via ymd()
    return countsByDate || {};
  }, [countsByDate]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">კალენდარი</p>
          <p className="text-xs text-zinc-500">{format(month, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            aria-label="Next month"
          >
            →
          </button>
          {selected ? (
            <button
              type="button"
              onClick={() => onSelect(undefined)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              წაშლა
            </button>
          ) : null}
        </div>
      </div>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={onSelect}
        showOutsideDays
        weekStartsOn={1}
        modifiers={{
          hasEvents: (date) => (countsForMonth[ymd(date)] ?? 0) > 0,
        }}
        modifiersClassNames={{
          hasEvents: "bg-red-50",
        }}
        classNames={{
          months: "w-full",
          month: "w-full",
          caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "w-10 text-center text-[11px] font-medium text-zinc-500",
          row: "mt-2 flex w-full",
          cell: "relative h-10 w-10 p-0 text-center",
          day: "relative h-10 w-10 rounded-xl text-sm text-zinc-800 hover:bg-zinc-100 transition-colors",
          day_today: "ring-1 ring-[var(--wineo-red)]",
          day_selected:
            "bg-[var(--wineo-red)] text-white hover:bg-[var(--wineo-red)] focus:bg-[var(--wineo-red)]",
          day_outside: "text-zinc-300",
        }}
        formatters={{
          formatCaption: (m) => format(m, "MMMM yyyy"),
        }}
        components={{
          DayButton: (props: DayButtonProps) => {
            const date = props.day.date;
            const count = countsForMonth[ymd(date)] ?? 0;
            return (
              <button {...props} className={props.className}>
                <span className="relative inline-flex h-10 w-10 items-center justify-center">
                  <span>{date.getDate()}</span>
                {count > 0 ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white"
                    aria-label={`${count} events`}
                  >
                    {count}
                  </span>
                ) : null}
                </span>
              </button>
            );
          },
        }}
      />

      <div className="mt-2 text-xs text-zinc-500">
        მონიშნეთ სასურველი თარიღი და მოძებნეთ ღონისძიებები. წითლად მონიშნულია რაოდენობა .
      </div>
    </div>
  );
}

