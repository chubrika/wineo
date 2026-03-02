"use client";

import Image from "next/image";
import Link from "next/link";
import type { ApiNewsItem } from "@/lib/api";
import { formatNewsDate } from "@/lib/formatNewsDate";

interface NewsListRowProps {
  item: ApiNewsItem;
}

export function NewsListRow({ item }: NewsListRowProps) {
  const slugOrId =
    (item.slug && item.slug.trim()) ? item.slug : (item.id ?? item._id ?? "");
  const linkHref = slugOrId ? `/news/${slugOrId}` : undefined;

  const content = (
    <>
      {item.imageUrl ? (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      ) : (
        <div className="h-16 w-24 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
          —
        </div>
      )}
      <div className="min-w-0 flex-1 py-0.5">
        <time className="text-xs text-zinc-500" dateTime={item.date}>
          {formatNewsDate(item.date)}
        </time>
        <p className="mt-0.5 text-sm font-medium text-zinc-900 line-clamp-2">
          {item.title}
        </p>
      </div>
    </>
  );

  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-2 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-2">
      {content}
    </div>
  );
}
