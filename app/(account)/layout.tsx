import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountGuard } from "@/components/account/AccountGuard";

export const metadata: Metadata = {
  title: "ჩემი ანგარიში",
  description: `პროფილი და განცხადებები — ${SITE_NAME}.`,
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AccountGuard>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-0 py-8 sm:px-6 lg:flex-row lg:px-8">
        <AccountSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AccountGuard>
  );
}
