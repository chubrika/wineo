import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "სიახლეები",
  description: "უახლესი სიახლეები და განახლებები ღვინის მოწყობილობების მარკეტპლეისიდან.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        სიახლეები
      </h1>
      <p className="mt-4 text-zinc-600">
        აქ გამოჩნდება უახლესი სიახლეები და განახლებები. მალე.
      </p>
    </div>
  );
}
