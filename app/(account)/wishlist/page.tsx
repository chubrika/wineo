import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { WishlistContent } from "./WishlistContent";

export const metadata: Metadata = {
  title: "სურვილების სია",
  description: `ჩემი სურვილების სია — ${SITE_NAME}.`,
};

export default function WishlistPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight wineo-red medium-font">
        სურვილების სია
      </h1>
      <WishlistContent />
    </div>
  );
}
