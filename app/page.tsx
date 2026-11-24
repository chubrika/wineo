import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  CategoriesCards,
  BuyRentSection,
  FeaturedListings,
  WineriesSection,
  RegionSection,
  HowItWorks,
  EventsSection,
  NewsSection,
} from "@/components/home";
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/constants/site";
import { buildMetadata, buildWebSiteJsonLd, DEFAULT_KEYWORDS } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getActiveHeroSlides, getCategories, getRegions } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: `ყველაფერი მეღვინეობა-მევენახეობაზე | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  path: "/",
  image: DEFAULT_OG_IMAGE,
  keywords: DEFAULT_KEYWORDS,
  openGraphType: "website",
});

export default async function HomePage() {
  const [slides, categories, regions] = await Promise.all([
    getActiveHeroSlides().catch(() => []),
    getCategories().catch(() => []),
    getRegions().catch(() => []),
  ]);

  return (
    <>
      <JsonLd data={buildWebSiteJsonLd()} />
      <HeroSection slides={slides} />
      <CategoriesCards categories={categories} />
      <BuyRentSection />
      <CategoryGrid categories={categories} />
      <FeaturedListings />
      <WineriesSection />
      <RegionSection regions={regions} />
      <EventsSection />
      <NewsSection />
      <HowItWorks />
    </>
  );
}
