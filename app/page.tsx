import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  BuyRentSection,
  FeaturedListings,
  RegionSection,
  HowItWorks,
} from "@/components/home";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "Buy or Rent Winemaking Equipment in Georgia",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `Buy or Rent Winemaking Equipment in Georgia | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BuyRentSection />
      <CategoryGrid />
      <FeaturedListings />
      <RegionSection />
      <HowItWorks />
    </>
  );
}
