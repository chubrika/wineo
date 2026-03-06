"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";
import { getActiveHeroSlides } from "@/lib/api";
import type { ApiHeroSlide } from "@/lib/api";
import { HeroSlideContent } from "./HeroSlide";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const FALLBACK_SLIDE: ApiHeroSlide = {
  id: "fallback",
  title: "განცხადებების ძებნა და დამატება",
  subtitle:
    "იყიდეთ ან იქირავეთ ბოთლები, კასრები, დანადგარები და ვენახის მიწები. დაუკავშირდით მყიდველებსა და დამქირავებლებს საქართველოს რეგიონებში.",
  buttonText: "განცხადების დამატება",
  buttonLink: "/add-product",
  image: "",
  mobileImage: "",
  order: 0,
  active: true,
};

export function HeroSlider() {
  const [slides, setSlides] = useState<ApiHeroSlide[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    getActiveHeroSlides()
      .then((items) => {
        setSlides(items.length > 0 ? items : [FALLBACK_SLIDE]);
      })
      .catch(() => {
        setSlides([FALLBACK_SLIDE]);
      });
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="relative h-full min-h-[320px] w-full md:min-h-[420px]" aria-hidden>
        <div className="absolute inset-0 bg-zinc-200" />
        <div className="relative flex min-h-[320px] h-full flex-col justify-center px-4 py-12 md:min-h-[420px]">
          <div className="h-8 w-3/4 max-w-md animate-pulse rounded bg-zinc-300" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-zinc-300" />
          <div className="mt-2 h-4 w-2/3 max-w-lg animate-pulse rounded bg-zinc-300" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <Swiper
      className="hero-swiper h-full w-full !overflow-hidden"
      modules={[EffectFade, Autoplay, Pagination, Navigation]}
      effect="fade"
      loop={slides.length > 1}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={{
        nextEl: ".hero-button-next",
        prevEl: ".hero-button-prev",
      }}
      speed={600}
      allowTouchMove={true}
      slidesPerView={1}
      spaceBetween={0}
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <HeroSlideContent slide={slide} />
        </SwiperSlide>
      ))}
      {/* Arrows: desktop only */}
      <button
        type="button"
        className="hero-button-prev absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 md:flex"
        aria-label="წინა სლაიდი"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        className="hero-button-next absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 md:flex"
        aria-label="შემდეგი სლაიდი"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </Swiper>
  );
}
