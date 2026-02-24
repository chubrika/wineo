import Link from "next/link";
import { REGIONS } from "@/constants/regions";

export function RegionSection() {
  return (
    <section
      className="border-b border-zinc-200 bg-white py-14 sm:py-18"
      aria-labelledby="regions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="regions-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Browse by Region
        </h2>
        <p className="mt-2 text-zinc-600">
          Explore listings across Georgian wine regions.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {REGIONS.map(({ slug, label }) => (
            <li key={slug}>
              <Link
                href={`/location/${slug}`}
                className="inline-flex rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
