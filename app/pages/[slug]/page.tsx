import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/api";
import { RichTextContent } from "@/components/listing/RichTextContent";
import { SITE_NAME } from "@/constants/site";
import { buildMetadata, truncateForMeta, buildCanonicalUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: SITE_NAME };
  const description =
    truncateForMeta(page.content ?? "", 160) || page.title;
  const path = `/pages/${(page.slug && page.slug.trim()) ? page.slug : slug}`;
  return buildMetadata({
    title: `${page.title} | ${SITE_NAME}`,
    description,
    path,
  });
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  const displaySlug = (page.slug && page.slug.trim()) ? page.slug : slug;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 bg-white  border border-zinc-200">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        მთავარი
      </Link>

      <article>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {page.title}
        </h1>
        {page.content?.trim() ? (
          <div className="mt-6 border-t border-zinc-200 pt-6">
            <RichTextContent
              content={page.content}
              className="text-base leading-relaxed text-zinc-700"
            />
          </div>
        ) : null}
      </article>
    </div>
  );
}
