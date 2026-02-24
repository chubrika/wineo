import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: "შესვლა / რეგისტრაცია",
  description: `შედით ან დარეგისტრირდით — ${SITE_NAME}.`,
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
