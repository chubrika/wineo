import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SITE_NAME } from "@/constants/site";
import { getPages } from "@/lib/api";

const socialLinks = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@georgianvineyard", icon: Youtube, label: "YouTube" },
] as const;

const staticFooterLinks = [
  { href: "/buy", label: "იყიდე" },
  { href: "/rent", label: "იქირავე" },
  { href: "/contact", label: "კონტაქტი" },
] as const;

export async function Footer() {
  const year = new Date().getFullYear();
  const cmsPages = await getPages();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-35 md:pb-10 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:items-center sm:gap-5 md:items-start">
            <div className="flex justify-center gap-4 sm:justify-start" aria-label="Social links">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 transition-colors hover:text-[var(--wineo-red)]"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-zinc-700 sm:text-left">
              © {year} {SITE_NAME}. მწარმოებლების და მყიდველების პლატფორმა. ყველაფერი მევენახეობაზე და მეღვინეობაზე.
            </p>
          </div>
          <nav
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 md:justify-end"
            aria-label="Footer navigation"
          >
            {staticFooterLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2 text-center text-sm text-zinc-600 transition-colors hover:text-[var(--wineo-red)] sm:py-0"
              >
                {label}
              </Link>
            ))}
            {cmsPages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                className="py-2 text-center text-sm text-zinc-600 transition-colors hover:text-[var(--wineo-red)] sm:py-0"
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
