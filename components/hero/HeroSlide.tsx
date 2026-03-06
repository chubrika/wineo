"use client";

import Link from "next/link";
import type { ApiHeroSlide } from "@/lib/api";

export type HeroSlideProps = {
  slide: ApiHeroSlide;
};

/**
 * Single hero slide: responsive background image (desktop ≥768px → image,
 * mobile → mobileImage or image), overlay gradient, centered title, subtitle, CTA.
 * Uses <picture> for responsive images and lazy loading.
 */
export function HeroSlideContent({ slide }: HeroSlideProps) {
  const desktopImage = slide.image || "";
  const mobileImage = slide.mobileImage || desktopImage;
  const hasMobileImage = Boolean(slide.mobileImage?.trim());

  return (
    <div className="relative flex min-h-[320px] h-full w-full flex-col justify-start md:justify-center px-4 py-12 text-center md:min-h-[420px] md:py-16">
      {/* Background: picture for responsive + lazy */}
      <div className="absolute inset-0 overflow-hidden">
        {(desktopImage || mobileImage) && (
          <picture>
            {hasMobileImage && (
              <source
                media="(max-width: 767px)"
                srcSet={mobileImage}
              />
            )}
            <img
              src={desktopImage || mobileImage}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              sizes="100vw"
            />
          </picture>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl">
        {slide.title && (
          <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl">
            {slide.title}
          </h1>
        )}
        {slide.subtitle && (
          <p className="mt-3 text-sm text-white/95 sm:text-base md:mt-4 md:text-lg lg:text-xl">
            {slide.subtitle}
          </p>
        )}
        {slide.buttonText && slide.buttonLink && (
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-8">
            <Link
              href={slide.buttonLink}
              className="inline-flex items-center justify-center rounded-lg border border-white/80 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#8a052d] hover:border-[#8a052d] md:px-5 md:py-3 md:text-base"
            >
              {slide.buttonText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
