import Link from "next/link";
import { getNewsList } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";

const NEWS_LIMIT = 4;

export async function NewsSection() {
  const { items } = await getNewsList({ limit: NEWS_LIMIT });

  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-14 sm:py-18"
      aria-labelledby="news-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="news-heading" className="text-2xl font-bold tracking-tight wineo-red sm:text-3xl">
              სიახლეები
            </h2>
          </div>
          {items.length > 0 && (
            <Link
              href="/news"
              className="mt-4 shrink-0 text-sm font-medium wineo-red hover:underline sm:mt-0"
            >
              ყველა სიახლე →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-zinc-500">სიახლეები ჯერ არ არის.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <NewsCard key={item.id ?? item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
