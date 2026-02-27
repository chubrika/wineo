import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";
import { AddProductForm } from "./AddProductForm";

export const metadata: Metadata = {
  title: "განცხადების დამატება",
  description: `ახალი განცხადების დამატება — ${SITE_NAME}.`,
};

export default function AddProductPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 medium-font">
        განცხადების დამატება
      </h1>
      <AddProductForm />
    </div>
  );
}
