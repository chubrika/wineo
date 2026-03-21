import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SITE_NAME } from "@/constants/site";
import { getPages } from "@/lib/api";
import Image from "next/image";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { HomeLogoLink } from "./HomeLogoLink";

const socialLinks = [
  {
    href: "https://www.facebook.com/wineo.ge",
    icon: Facebook,
    label: "Facebook",
  },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  {
    href: "https://www.youtube.com/@georgianvineyard",
    icon: Youtube,
    label: "YouTube",
  },
] as const;

const footerSections = [
  {
    title: "ნავიგაცია",
    links: [
      { href: "/buy", label: "იყიდე" },
      { href: "/rent", label: "იქირავე" },
      { href: "/contact", label: "კონტაქტი" },
    ],
  },
] as const;

export async function Footer() {
  const year = new Date().getFullYear();
  const cmsPages = await getPages();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="relative mx-auto max-w-7xl px-4 py-10 pb-20 md:pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <HomeLogoLink className="inline-flex items-center text-base font-semibold tracking-tight">
              {/* <Image src="/logo.svg" alt="wineo.ge" width={100} height={100} priority /> */}
              <div className="text-2xl font-semibold tracking-tight ">
                <span className="wineo-red">W</span>
                <span className="text-zinc-900">ineo.ge</span>
              </div>
            </HomeLogoLink>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
              იყიდე, გაყიდე, იქირავე ან გააქირავე. ყველაფერი მევენახეობაზე და
              მეღვინეობაზე.
            </p>

            <ul
              className="mt-5 flex flex-wrap items-center gap-3"
              aria-label="Social links"
            >
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:text-[var(--wineo-red)] hover:ring-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-8 grid-cols-2">
              {footerSections.map((section) => (
                <nav key={section.title} aria-label={section.title}>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {section.title}
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-zinc-600 transition-colors hover:text-[var(--wineo-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              <nav aria-label="გვერდები">
                <h2 className="text-sm font-semibold text-zinc-900">
                  გვერდები
                </h2>
                <ul className="mt-4 space-y-2">
                  {cmsPages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={`/pages/${page.slug}`}
                        className="text-sm text-zinc-600 transition-colors hover:text-[var(--wineo-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 md:pt-10">
          <p className="text-sm text-zinc-500">
            © {year} {SITE_NAME}. ყველა უფლება დაცულია.
          </p>
        </div>

        <ScrollToTopButton className="absolute bottom-17 md:bottom-6 right-4 sm:right-6" />
      </div>
    </footer>
  );
}
