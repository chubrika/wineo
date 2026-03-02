import type { Metadata } from "next";
import { getNewsList } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";

export const metadata: Metadata = {
  title: "სიახლეები",
  description: "უახლესი სიახლეები და განახლებები ღვინის მოწყობილობების მარკეტპლეისიდან.",
};

export default async function NewsPage() {
  const { items, total } = await getNewsList({ limit: 50 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        სიახლეები
      </h1>
      <p className="mt-2 text-zinc-600">
        უახლესი სიახლეები და განახლებები.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 text-zinc-500">სიახლეები ჯერ არ არის.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
