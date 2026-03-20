import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  CategoriesCards,
  BuyRentSection,
  FeaturedListings,
  RegionSection,
  HowItWorks,
  EventsSection,
  NewsSection,
} from "@/components/home";
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/constants/site";
import { buildMetadata, DEFAULT_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `ყველაფერი მეღვინეობა-მევენახეობაზე | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  path: "/",
  image: DEFAULT_OG_IMAGE,
  keywords: DEFAULT_KEYWORDS,
  openGraphType: "website",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesCards />
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
