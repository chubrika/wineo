import Link from "next/link";
import Image from "next/image";
import type { ApiEvent } from "@/types/event";

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

export function EventCard({ event }: { event: ApiEvent }) {
  const href = `/events/${encodeURIComponent(event.slug)}`;
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-zinc-100">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 560px"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {event.category ? (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {event.category}
            </span>
          ) : null}
          {event.isFeatured ? (
            <span className="rounded-full bg-[var(--wineo-red)]/10 px-2.5 py-1 text-xs font-medium text-[var(--wineo-red)]">
              Featured
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold tracking-tight text-zinc-900">
          {event.title}
        </h3>

        {event.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
            {event.shortDescription}
          </p>
        ) : null}

        <dl className="mt-3 space-y-1 text-sm text-zinc-700">
          <div className="flex items-start gap-2">
            <dt className="w-16 shrink-0 text-zinc-500">თარიღი: </dt>
            <dd className="min-w-0">{formatDateTime(event) || "—"}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="w-25 shrink-0 text-zinc-500">მდებარეობა: </dt>
            <dd className="min-w-0">
              {event.isOnline ? (
                <span>ონლაინ</span>
              ) : (
                <span> {event.city || "—"}</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 inline-flex items-center text-sm font-medium text-[var(--wineo-red)]">
          დეტალების ნახვა
          <span className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

