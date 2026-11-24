import Link from "next/link";
import { getWineries } from "@/lib/api";
import { WineryCard } from "@/components/wineries/WineryCard";

const WINERIES_LIMIT = 4;

export async function WineriesSection() {
  const wineries = (await getWineries({ sort: "newest", limit: WINERIES_LIMIT })).slice(0, WINERIES_LIMIT);

  if (wineries.length === 0) return null;

  return (
    <section
      className="border-b border-zinc-200 py-8 md:py-14 sm:py-18 px-4 md:px-0"
      aria-labelledby="wineries-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <h2
            id="wineries-heading"
            className="text-md tracking-widest md:text-2xl nav-font-caps font-bold tracking-tight wineo-red sm:text-3xl"
          >
            მარნები
          </h2>
          <Link href="/wineries" className="shrink-0 text-sm font-medium wineo-red hover:underline">
            ყველა მარანი →
          </Link>
        </div>

        <ul className="mt-6 md:mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wineries.map((winery) => (
            <li key={winery.id}>
              <WineryCard winery={winery} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
