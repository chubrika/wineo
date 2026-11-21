import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ელფოსტის დადასტურება",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
