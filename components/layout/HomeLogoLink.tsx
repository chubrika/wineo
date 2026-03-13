"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEventHandler, ReactNode } from "react";

type HomeLogoLinkProps = {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function HomeLogoLink({ children, className, onClick }: HomeLogoLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}

