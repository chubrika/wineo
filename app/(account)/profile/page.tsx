import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { ProfileContent } from "./ProfileContent";

export const metadata: Metadata = {
  title: "პროფილი",
  description: `ჩემი პროფილი — ${SITE_NAME}.`,
};

export default function ProfilePage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
        პროფილი
      </h1>
      <ProfileContent />
    </div>
  );
}
