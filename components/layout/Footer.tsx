import Link from "next/link";
import { SITE_NAME } from "@/constants/site";

const footerLinks = [
  { href: "/buy", label: "იყიდე" },
  { href: "/rent", label: "იქირავე" },
  { href: "/about", label: "ჩვენ შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm font-medium text-zinc-700 sm:text-left">
            © {year} {SITE_NAME}. მწარმოებლების და მყიდველების პლატფორმა. ყველაფერი მევენახეობაზე და მეღვინეობაზე.
          </p>
          <nav
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 md:justify-end"
            aria-label="Footer navigation"
          >
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2 text-center text-sm text-zinc-600 transition-colors hover:text-zinc-900 sm:py-0"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
