import Link from "next/link";
import { fetchEventsList } from "@/lib/events-api";
import { EventCard } from "@/components/events/EventCard";

const EVENTS_LIMIT = 4;

export async function EventsSection() {
  const { items } = await fetchEventsList({ page: 1, limit: EVENTS_LIMIT }).catch(() => ({
    items: [],
    total: 0,
  }));

  return (
    <section
      className="border-b border-zinc-200 bg-white py-8 md:py-14 sm:py-18"
      aria-labelledby="events-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="events-heading" className="text-md md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl">
              ღონისძიებები
            </h2>
          </div>
          {items.length > 0 && (
            <Link
              href="/events"
              className="shrink-0 text-sm font-medium wineo-red hover:underline sm:mt-0"
            >
              ყველა ღონისძიება →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-zinc-500">ღონისძიებები ჯერ არ არის.</p>
        ) : (
          <div className="mt-6 md:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
