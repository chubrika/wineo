import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { getPages } from "@/lib/api";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = buildMetadata({
  title: "კონტაქტი",
  description: `დაგვიკავშირდით — ${SITE_NAME}. კითხვები, წინადადებები და მხარდაჭერა.`,
  path: "/contact",
});

export default async function ContactPage() {
  const pages = await getPages();
  const privacy = pages.find((page) =>
    /privacy|konfidencial|კონფიდენც/i.test(`${page.slug} ${page.title}`)
  );

  return <ContactView privacyHref={privacy ? `/pages/${privacy.slug}` : null} />;
}
