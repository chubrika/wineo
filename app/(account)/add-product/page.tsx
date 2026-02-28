import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { AddProductForm } from "./AddProductForm";

export const metadata: Metadata = {
  title: "განცხადების დამატება",
  description: `ახალი განცხადების დამატება — ${SITE_NAME}.`,
};

export default function AddProductPage() {
  return (
    <div className="p-3 sm:p-4">
      <h1 className="text-2xl font-bold wineo-red tracking-tight text-zinc-900 medium-font">
        განცხადების დამატება
      </h1>
      <AddProductForm />
    </div>
  );
}
