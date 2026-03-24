import type { Metadata } from "next";
import { getNewsList } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import { SITE_NAME } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `სიახლეები | ${SITE_NAME}`,
  description:
    "უახლესი სიახლეები და განახლებები ღვინის მოწყობილობების მარკეტპლეისიდან.",
  path: "/news",
  keywords: ["სიახლეები", "wineo", "winemaking", "Georgia", "wine equipment"],
});

export default async function NewsPage() {
  const { items, total } = await getNewsList({ limit: 50 });

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        სიახლეები
      </h1>
      <p className="mt-2 text-zinc-600">
        უახლესი სიახლეები და განახლებები.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 text-zinc-500">სიახლეები ჯერ არ არის.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <NewsCard key={item.id ?? item._id} item={item} />
          ))}
        </div>
      )}

      {total > items.length ? (
        <p className="mt-6 text-sm text-zinc-500">
          ნაჩვენებია {items.length} სიახლე {total}-დან.
        </p>
      ) : null}
    </div>
  );
}
