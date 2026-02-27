import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { ProductsContent } from "./ProductsContent";

export const metadata: Metadata = {
  title: "ჩემი განცხადებები",
  description: `ჩემი განცხადებები — ${SITE_NAME}.`,
};

export default function ProductsPage() {
  return <ProductsContent />;
}
