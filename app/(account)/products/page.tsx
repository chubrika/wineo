import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "ჩემი განცხადებები",
  description: `ჩემი განცხადებები — ${SITE_NAME}.`,
};

export default function ProductsPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
        განცხადებები
      </h1>
      <p className="mt-4 text-zinc-600">
        აქ გამოჩნდება თქვენი დამატებული განცხადებები.
      </p>
    </div>
  );
}
