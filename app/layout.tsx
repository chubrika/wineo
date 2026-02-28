import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { FiltersModalProvider } from "@/contexts/FiltersModalContext";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Buy & Rent Winemaking Equipment`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased flex flex-col`}
      >
        <AuthProvider>
          <FiltersModalProvider>
            <Header />
            <main className="flex-1 bg-[color:#f1f3f6] pb-20 lg:pb-0">{children}</main>
            <Footer />
          </FiltersModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
