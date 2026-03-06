export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-zinc-100" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-5 w-full animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-100" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

