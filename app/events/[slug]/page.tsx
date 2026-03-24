import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events-api";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/constants/site";
import { buildMetadata, truncateForMeta, buildCanonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { RichTextContent } from "@/components/listing/RichTextContent";
import type { ApiEvent } from "@/types/event";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function formatDateTime(e: ApiEvent): string {
  const d = new Date(e.eventDate);
  const date = isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  const time =
    e.startTime && e.endTime
      ? `${e.startTime} – ${e.endTime}`
      : e.startTime
        ? e.startTime
        : e.endTime
          ? e.endTime
          : "";
  return [date, time].filter(Boolean).join(" • ");
}

function buildEventJsonLd(event: ApiEvent, canonicalUrl: string) {
  const image =
    event.image && event.image.startsWith("http")
      ? event.image
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  const location = event.isOnline
    ? {
        "@type": "VirtualLocation",
        url: event.onlineLink || canonicalUrl,
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
    url: canonicalUrl,
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
      url: canonicalUrl,
      availability: "https://schema.org/InStock",
    };
  }

  return json;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventBySlug(slug, { next: { revalidate } });
  if (!ev) return { title: `Events | ${SITE_NAME}` };

  const currentSlug = (ev.slug && ev.slug.trim()) ? ev.slug : slug;
  const description =
    (ev.seoDescription && ev.seoDescription.trim()) ||
    truncateForMeta(ev.shortDescription || ev.description || "", 155) ||
    ev.title ||
    "Event details.";

  return buildMetadata({
    title: `${(ev.seoTitle && ev.seoTitle.trim()) ? ev.seoTitle : ev.title} | ${SITE_NAME}`,
    description,
    path: `/events/${currentSlug}`,
    image: ev.image || undefined,
    openGraphType: "website",
    keywords: ["events", "wine events", ev.category].filter(Boolean) as string[],
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const ev = await getEventBySlug(slug, { next: { revalidate } });
  if (!ev) notFound();

  const currentSlug = (ev.slug && ev.slug.trim()) ? ev.slug : slug;
  const canonicalUrl = buildCanonicalUrl(`/events/${currentSlug}`);
  const jsonLd = buildEventJsonLd(ev, canonicalUrl);

  const when = formatDateTime(ev);
  const where = ev.isOnline ? "ონლაინ" : (ev.locationName || ev.city || "—");
  const price =
    ev.price != null ? `${ev.price} ${ev.currency || ""}`.trim() : null;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 md:px-0">
      <JsonLd data={jsonLd} />

      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ყველა ღონისძიება
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <article className="min-w-0">
          {ev.image ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100">
              <Image
                src={ev.image}
                alt={ev.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] w-full rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
              სურათი არ არის
            </div>
          )}

          <header className="mt-6">
            {ev.category ? (
              <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {ev.category}
              </div>
            ) : null}
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {ev.title}
            </h1>
            {ev.shortDescription ? (
              <p className="mt-3 text-lg text-zinc-600">{ev.shortDescription}</p>
            ) : null}
          </header>

          {ev.description?.trim() ? (
            <div className="mt-6 border-t border-zinc-200 pt-6">
              <RichTextContent content={ev.description} className="text-base leading-relaxed" />
            </div>
          ) : null}
        </article>

        <aside className="lg:pt-0">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">დეტალები</h2>

            <dl className="mt-4 space-y-3 text-sm text-zinc-700">
              <div>
                <dt className="text-xs font-medium text-zinc-500">თარიღი</dt>
                <dd className="mt-1">{when || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">მდებარეობა</dt>
                <dd className="mt-1">{where}</dd>
              </div>
              {ev.isOnline && ev.onlineLink ? (
                <div>
                  <dt className="text-xs font-medium text-zinc-500">ლინკი</dt>
                  <dd className="mt-1">
                    <a
                      href={ev.onlineLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--wineo-red)] hover:underline"
                    >
                      გახსნა
                    </a>
                  </dd>
                </div>
              ) : null}
              {!ev.isOnline && ev.googleMapsLink ? (
                <div>
                  <dt className="text-xs font-medium text-zinc-500">Google Maps</dt>
                  <dd className="mt-1">
                    <a
                      href={ev.googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--wineo-red)] hover:underline"
                    >
                      რუკაზე ნახვა
                    </a>
                  </dd>
                </div>
              ) : null}
              {price ? (
                <div>
                  <dt className="text-xs font-medium text-zinc-500">ფასი</dt>
                  <dd className="mt-1">{price}</dd>
                </div>
              ) : null}
              {ev.capacity != null ? (
                <div>
                  <dt className="text-xs font-medium text-zinc-500">ადგილები</dt>
                  <dd className="mt-1">{ev.capacity}</dd>
                </div>
              ) : null}
            </dl>

            {(ev.organizerName || ev.organizerEmail || ev.organizerPhone) ? (
              <div className="mt-6 border-t border-zinc-200 pt-5">
                <h3 className="text-sm font-semibold text-zinc-900">ორგანიზატორი</h3>
                <div className="mt-2 space-y-1 text-sm text-zinc-700">
                  {ev.organizerName ? <p>{ev.organizerName}</p> : null}
                  {ev.organizerEmail ? <p>{ev.organizerEmail}</p> : null}
                  {ev.organizerPhone ? <p>{ev.organizerPhone}</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

