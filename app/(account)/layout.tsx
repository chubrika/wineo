import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const metadata: Metadata = {
  title: "ჩემი ანგარიში",
  description: `პროფილი და განცხადებები — ${SITE_NAME}.`,
};

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <AccountSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
