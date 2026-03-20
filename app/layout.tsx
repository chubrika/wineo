import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Header, Footer } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { FiltersModalProvider } from "@/contexts/FiltersModalContext";
import { LoginModalProvider } from "@/contexts/LoginModalContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CategoriesModalProvider } from "@/contexts/CategoriesModalContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from "@/constants/site";
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
    default: `${SITE_NAME} | იყიდე, გაყიდე, იქირავე ან გააქირავე`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE],
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QYG9Y34ND3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QYG9Y34ND3');
          `}
        </Script>
        <AuthProvider>
          <FiltersModalProvider>
            <LoginModalProvider>
              <WishlistProvider>
                <CategoriesModalProvider>
                  <Header />
                  <main className="flex-1 bg-[color:#f1f3f6] pb-20 lg:pb-0">{children}</main>
                  <Footer />
                  <LoginModal />
                </CategoriesModalProvider>
              </WishlistProvider>
            </LoginModalProvider>
          </FiltersModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
