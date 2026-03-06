import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">ღონისძიება ვერ მოიძებნა</h1>
        <p className="mt-2 text-sm text-zinc-600">
          შესაძლოა ღონისძიება წაშლილია ან ბმული არასწორია.
        </p>
        <div className="mt-6">
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--wineo-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            დაბრუნება ღონისძიებებზე
          </Link>
        </div>
      </div>
    </div>
  );
}

