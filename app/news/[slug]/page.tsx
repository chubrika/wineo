import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getNewsList } from "@/lib/api";
import { formatNewsDate } from "@/lib/formatNewsDate";
import { RichTextContent } from "@/components/listing/RichTextContent";
import { NewsListRow } from "@/components/news/NewsListRow";
import { SITE_NAME } from "@/constants/site";
import {
  buildMetadata,
  truncateForMeta,
  newsToArticleJsonLd,
  buildCanonicalUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "სიახლეები" };
  const description =
    truncateForMeta(
      item.fullDescription || item.shortDescription || "",
      150
    ) ||
    item.shortDescription ||
    item.title ||
    "News article.";
  const path = `/news/${(item.slug && item.slug.trim()) ? item.slug : slug}`;
  return buildMetadata({
    title: `${item.title} | ${SITE_NAME}`,
    description,
    path,
    image: item.imageUrl || undefined,
    openGraphType: "article",
    article: {
      publishedTime: item.date,
      modifiedTime: item.updatedAt || item.date,
      authors: [SITE_NAME],
    },
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, listRes] = await Promise.all([
    getNewsBySlug(slug),
    getNewsList({ limit: 4 }),
  ]);

  if (!item) notFound();

  const currentSlug = (item.slug && item.slug.trim()) ? item.slug : slug;
  const currentId = item.id ?? item._id;
  const canonicalUrl = buildCanonicalUrl(`/news/${currentSlug}`);
  const articleJsonLd = newsToArticleJsonLd(item, canonicalUrl);

  const sidebarItems = listRes.items
    .filter((n) => {
      const nSlug = (n.slug && n.slug.trim()) ? n.slug : "";
      const nId = n.id ?? n._id;
      return nSlug !== currentSlug && nId !== currentId;
    })
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: full article */}
        <article className="min-w-0">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ყველა სიახლე
          </Link>

          {item.imageUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
              სურათი არ არის
            </div>
          )}

          <header className="mt-6">
            <time className="text-sm text-zinc-500" dateTime={item.date}>
              {formatNewsDate(item.date)}
            </time>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {item.title}
            </h1>
            {item.shortDescription ? (
              <p className="mt-3 text-lg text-zinc-600">{item.shortDescription}</p>
            ) : null}
          </header>

          {item.fullDescription?.trim() ? (
            <div className="mt-6 border-t border-zinc-200 pt-6">
              <RichTextContent
                content={item.fullDescription}
                className="text-base leading-relaxed"
              />
            </div>
          ) : null}
        </article>

        {/* Right: latest news list (photo left, info right) */}
        <aside className="lg:pt-0">
          <h2 className="text-lg font-semibold text-zinc-900">სიახლეები</h2>
          {sidebarItems.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">სხვა სიახლეები ჯერ არ არის.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {sidebarItems.map((sideItem) => (
                <li key={sideItem.id ?? sideItem._id}>
                  <NewsListRow item={sideItem} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
