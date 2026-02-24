import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

export function CategoryGrid() {
  return (
    <section
      className="border-b border-zinc-200 bg-white py-14 sm:py-18"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          მოძებნეთ კატეგორიით
        </h2>
        <p className="mt-2 text-zinc-600">
          მოძებნეთ აღჭურვილობები და მიწები კატეგორიით.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ slug, label }) => (
            <li key={slug}>
              <Link
                href={`/category/${slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 px-5 py-4 text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                <span className="font-medium">{label}</span>
                <span className="text-zinc-400" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
