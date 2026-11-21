import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "პაროლის აღდგენა",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
