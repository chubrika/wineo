import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "კონტაქტი",
  description: `დაგვიკავშირდით — ${SITE_NAME}. კითხვები, წინადადებები და მხარდაჭერა.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        კონტაქტი
      </h1>
      <div className="mt-6 space-y-6 text-zinc-600">
        <p>
          გაქვთ კითხვები ან გსურთ თანამშრომლობა? დაგვიკავშირდით.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-zinc-500">ელფოსტა</dt>
              <dd>
                <a
                  href="mailto:info@example.com"
                  className="font-medium text-zinc-900 hover:underline"
                >
                  info@example.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500">ტელეფონი</dt>
              <dd>
                <a
                  href="tel:+995000000000"
                  className="font-medium text-zinc-900 hover:underline"
                >
                  +995 000 000 000
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
