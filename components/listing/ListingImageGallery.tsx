"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

type ListingImageGalleryProps = {
  images: string[];
  alt: string;
  /** Main image aspect ratio class, e.g. aspect-[16/10] */
  mainClass?: string;
  /** Show badge top-right on main image (e.g. "new" / "used") */
  condition?: string;
  /** Show badge left on main image when not "none" */
  promotionType?: "none" | "highlighted" | "featured" | "homepageTop";
  /** Badge bottom-right: "rent" → ქირავდება, else → იყიდება */
  listingType?: "buy" | "rent";
};

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Georgian labels for condition */
function conditionLabel(condition: string): string {
  const c = condition.toLowerCase();
  if (c === "new") return "ახალი";
  if (c === "used") return "მეორადი";
  return condition;
}

export function ListingImageGallery({ images, alt, mainClass = "aspect-[16/10]", condition, promotionType, listingType = "buy" }: ListingImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = images.length > 1;
  const hasPromotion = promotionType && promotionType !== "none";
  const promotionLabel =
    promotionType === "homepageTop"
      ? "Top"
      : promotionType === "featured"
        ? "Featured"
        : promotionType === "highlighted"
          ? "Highlighted"
          : "";

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 ${mainClass}`}>
        <Image
          key={currentIndex}
          src={images[currentIndex]}
          alt={alt}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {condition && (
          <span
            className={`absolute right-2 top-2 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm ${
              condition.toLowerCase() === "new"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {conditionLabel(condition)}
          </span>
        )}
        {hasPromotion && promotionLabel && (
          <span
            className={`absolute left-2 top-2 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm ${
              promotionType === "featured"
                ? "bg-amber-400 text-zinc-900"
                : promotionType === "homepageTop"
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-700 text-white"
            }`}
          >
            <StarIcon className="h-3.5 w-3.5 shrink-0" />
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-sm">
          {listingType === "rent" ? "ქირავდება" : "იყიდება"}
        </span>
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-700" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-zinc-700" />
            </button>
          </>
        )}
      </div>
      {hasMultiple && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 flex-wrap gap-2">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === currentIndex ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <Image src={url} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
