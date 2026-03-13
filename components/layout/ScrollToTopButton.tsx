"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

type ScrollToTopButtonProps = {
  showAfterPx?: number;
  className?: string;
};

export function ScrollToTopButton({ showAfterPx = 320, className }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > showAfterPx);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterPx]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes scroll-top-arrow-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-scroll-top-arrow {
          animation: scroll-top-arrow-float 2s ease-in-out infinite;
        }
      `}</style>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={[
          "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:text-[var(--wineo-red)] hover:ring-zinc-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2",
          className ?? "",
        ].join(" ")}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 animate-scroll-top-arrow" aria-hidden="true" />
      </button>
    </>
  );
}

