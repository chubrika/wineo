import type { Metadata } from "next";
import { buildMetadata, DEFAULT_KEYWORDS } from "@/lib/seo";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/constants/site";
import { fetchEventsCalendar, fetchEventsList } from "@/lib/events-api";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import type { ApiEvent } from "@/types/event";

export const metadata: Metadata = buildMetadata({
  title: `Events | ${SITE_NAME}`,
  description: "Discover wine events: tastings, festivals, workshops and more.",
  path: "/events",
  image: DEFAULT_OG_IMAGE,
  keywords: [...DEFAULT_KEYWORDS, "wine events", "tasting", "festival"],
  openGraphType: "website",
});

export const revalidate = 60;

function isYmd(s: string | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function buildEventJsonLd(event: ApiEvent) {
  const url = `${SITE_URL}/events/${encodeURIComponent(event.slug)}`;
  const image = event.image?.startsWith("http") ? event.image : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  const location = event.isOnline
    ? {
        "@type": "VirtualLocation",
        url: event.onlineLink || url,
      }
    : {
        "@type": "Place",
        name: event.locationName || event.city || "Event location",
        address: {
          "@type": "PostalAddress",
          streetAddress: event.address || undefined,
          addressLocality: event.city || undefined,
          addressCountry: event.country || undefined,
        },
      };

  const status =
    event.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled";

  const attendanceMode = event.isOnline
    ? "https://schema.org/OnlineEventAttendanceMode"
    : "https://schema.org/OfflineEventAttendanceMode";

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription || event.description,
    image,
    startDate: event.eventDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventStatus: status,
    eventAttendanceMode: attendanceMode,
    location,
    url,
  };

  if (event.organizerName) {
    json.organizer = {
      "@type": "Organization",
      name: event.organizerName,
      ...(event.organizerEmail ? { email: event.organizerEmail } : {}),
      ...(event.organizerPhone ? { telephone: event.organizerPhone } : {}),
    };
  }

  if (event.price != null && event.currency) {
    json.offers = {
      "@type": "Offer",
      price: event.price,
      priceCurrency: event.currency,
      url,
      availability: "https://schema.org/InStock",
    };
  }

  return json;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const date = typeof sp.date === "string" && isYmd(sp.date) ? sp.date : null;

  const [countsByDate, list] = await Promise.all([
    fetchEventsCalendar({ next: { revalidate } }).catch(() => ({})),
    fetchEventsList({ date, page: 1, limit: 10 }).catch(() => ({ items: [], total: 0 })),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": list.items.map(buildEventJsonLd),
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">ღონისძიებები</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          დაგეგმილი ღონისძიებების სია. კალენდარის დახმარებით შეგიძლიათ მოძებნოთ ღონისძიებები და გაეცნოთ.
        </p>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <EventsPageClient countsByDate={countsByDate} initialItems={list.items} initialTotal={list.total} />
    </div>
  );
}

