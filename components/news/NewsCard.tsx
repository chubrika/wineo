"use client";

import Image from "next/image";
import Link from "next/link";
import type { ApiNewsItem } from "@/lib/api";
import { formatNewsDate } from "@/lib/formatNewsDate";
import { RichTextContent } from "@/components/listing/RichTextContent";

export { formatNewsDate };

interface NewsCardProps {
  item: ApiNewsItem;
  /** If true, show full description below the card summary */
  expandFull?: boolean;
  /** When set, the card is wrapped in a link to this href (e.g. /news/[id]) */
  href?: string;
  /** Compact variant for sidebar: smaller image and text */
  compact?: boolean;
}

export function NewsCard({ item, expandFull = false, href, compact = true }: NewsCardProps) {
  const slugOrId = (item.slug && item.slug.trim()) ? item.slug : (item.id ?? item._id ?? "");
  const linkHref = href ?? (slugOrId ? `/news/${slugOrId}` : undefined);

  const content = (
    <>
      {item.imageUrl ? (
        <div
          className={`relative w-full shrink-0 overflow-hidden bg-zinc-100 ${
            compact ? "aspect-[16/10]" : "aspect-[16/10]"
          }`}
        >
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes={compact ? "200px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full shrink-0 bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">
          სურათი არ არის
        </div>
      )}
      <div className={`flex flex-1 flex-col min-h-0 ${compact ? "p-3" : "p-4"}`}>
        <time className="text-xs text-zinc-500 shrink-0" dateTime={item.date}>
          {formatNewsDate(item.date)}
        </time>
        <h2
          className={`mt-1 font-medium text-zinc-900 line-clamp-2 shrink-0 ${
            compact ? "text-sm min-h-[2rem]" : "min-h-[2.5rem]"
          }`}
        >
          {item.title}
        </h2>
        {/* {!compact ? (
          <p className="mt-2 text-sm text-zinc-600 line-clamp-3 min-h-[3.75rem] flex-shrink-0">
            {item.shortDescription || "\u00A0"}
          </p>
        ) : item.shortDescription ? (
          <p className="mt-1 text-xs text-zinc-600 line-clamp-2 min-h-[2rem]">
            {item.shortDescription}
          </p>
        ) : null} */}
        {expandFull && item.fullDescription?.trim() ? (
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <RichTextContent content={item.fullDescription} />
          </div>
        ) : null}
      </div>
    </>
  );

  const card = (
    <article
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md ${
        linkHref ? "cursor-pointer" : ""
      }`}
    >
      {content}
    </article>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block h-full">
        {card}
      </Link>
    );
  }
  return card;
}
