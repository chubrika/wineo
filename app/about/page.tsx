import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ",
  description: `გაიგეთ მეტი ${SITE_NAME}-ის შესახებ — ღვინის მოწყობილობების ყიდვა და გაქირავება.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        ჩვენ შესახებ
      </h1>
      <div className="mt-6 space-y-4 text-zinc-600">
        <p>
          {SITE_NAME} — პლატფორმა ღვინის მოწყობილობების ყიდვისა და გაქირავებისთვის.
        </p>
        <p>
          ჩვენი მიზანია დავაკავშიროთ მწარმოებლები და მყიდველები, რათა ყველას
          ჰქონდეს წვდომა ხარისხიან აღჭურვილობაზე.
        </p>
      </div>
    </div>
  );
}
