import Link from "next/link";
import { getNewsList } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";

const NEWS_LIMIT = 4;

export async function NewsSection() {
  const { items } = await getNewsList({ limit: NEWS_LIMIT });

  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-8 md:py-14 sm:py-18 px-4 md:px-0"
      aria-labelledby="news-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="news-heading" className="text-md md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl">
              სიახლეები
            </h2>
          </div>
          {items.length > 0 && (
            <Link
              href="/news"
              className="shrink-0 text-sm font-medium wineo-red hover:underline sm:mt-0"
            >
              ყველა სიახლე →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-zinc-500">სიახლეები ჯერ არ არის.</p>
        ) : (
          <div className="w-full max-w-full overflow-x-auto pb-2 md:overflow-visible">
            <div className="mt-6 md:mt-10 flex gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {items.map((item) => (
                <div key={item.id ?? item._id} className="w-[230px] shrink-0 md:w-auto md:shrink">
                  <NewsCard item={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
