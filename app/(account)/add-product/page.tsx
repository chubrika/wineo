import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { AddProductForm } from "./AddProductForm";

export const metadata: Metadata = {
  title: "განცხადების დამატება",
  description: `ახალი განცხადების დამატება — ${SITE_NAME}.`,
};

export default function AddProductPage() {
  return (
    <div className="md:p-0 p-2">
      <h1 className="text-md md:text-lg nav-font-caps mb-4 font-bold tracking-tight wineo-red">
        განცხადების დამატება
      </h1>
      <AddProductForm />
    </div>
  );
}
