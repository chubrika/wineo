import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  BuyRentSection,
  FeaturedListings,
  RegionSection,
  HowItWorks,
  EventsSection,
  NewsSection,
} from "@/components/home";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants/site";
import { buildMetadata, DEFAULT_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `ყველაფერი მეღვინეობა-მევენახეობაზე | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  path: "/",
  image: "/og-default.png",
  keywords: DEFAULT_KEYWORDS,
  openGraphType: "website",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BuyRentSection />
      <CategoryGrid />
      <FeaturedListings />
      <RegionSection />
      <EventsSection />
      <NewsSection />
      <HowItWorks />
    </>
  );
}
