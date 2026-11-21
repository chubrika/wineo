"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";
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

export function HeroSlider({ slides }: { slides: ApiHeroSlide[] }) {
  const list = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    setEnhanced(true);
  }, []);

  if (!enhanced) {
    return (
      <div className="relative h-full min-h-[320px] w-full md:min-h-[420px]">
        <HeroSlideContent slide={list[0]} titleAs="h1" />
        {list.length > 1 ? (
          <ul className="sr-only">
            {list.slice(1).map((slide) => (
              <li key={slide.id}>
                <p>{slide.title}</p>
                {slide.subtitle ? <p>{slide.subtitle}</p> : null}
                {slide.buttonLink ? (
                  <Link href={slide.buttonLink}>{slide.buttonText || slide.title}</Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <Swiper
      className="hero-swiper h-full w-full !overflow-hidden"
      modules={[EffectFade, Autoplay, Pagination, Navigation]}
      effect="fade"
      loop={list.length > 1}
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
      {list.map((slide, index) => (
        <SwiperSlide key={slide.id}>
          <HeroSlideContent slide={slide} titleAs={index === 0 ? "h1" : "span"} />
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
