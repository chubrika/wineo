import Link from "next/link";
import { ContentImage } from "@/components/media/ContentImage";
import { Calendar, Check, Clock, Facebook, Globe, Instagram, Mail, MapPin, Phone, Wine } from "lucide-react";
import type { ApiWinery, GrapeColor } from "@/lib/api";
import { mapApiProductToListing } from "@/lib/listings";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { GRAPE_COLOR_LABELS, latinNameFromSlug } from "@/lib/encyclopedia";
import { WINERY_TYPE_LABELS, externalHref, formatCount, mapsHref, phoneHref } from "@/lib/wineries";

function formatHectares(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return null;
  const text = new Intl.NumberFormat("ka", { maximumFractionDigits: 1 }).format(value);
  return `${text} ჰექტარი`;
}

function grapeColorLabel(color?: string) {
  if (!color || !(color in GRAPE_COLOR_LABELS)) return "";
  return GRAPE_COLOR_LABELS[color as GrapeColor];
}

function methodDot(method: string) {
  const value = method.toLowerCase();
  if (value.includes("ქვევრ")) return "bg-[#d4a017]";
  if (value.includes("ბიო") || value.includes("ორგან")) return "bg-[#3c9a62]";
  if (value.includes("ქალ")) return "bg-[#721c24]";
  if (value.includes("დაყოვნ")) return "bg-[#c47b8a]";
  if (value.includes("კლასიკ") || value.includes("მუხ")) return "bg-[#8a6a4a]";
  return "bg-[#b08980]";
}

export function WineryDetail({ winery }: { winery: ApiWinery }) {
  const regionLabel = winery.region?.label || winery.region?.slug || "";
  const place = [winery.microzone?.trim(), regionLabel].filter(Boolean);
  const grapes = (winery.grapes ?? []).filter((grape) => grape.name || grape.slug);
  const methods = winery.winemakingMethods ?? [];
  const services = (winery.tourism?.services ?? []).filter(Boolean);
  const hours = winery.tourism?.workingHours?.trim() || "";
  const acceptsVisitors = Boolean(winery.tourism?.acceptsVisitors);
  const hectares = formatHectares(winery.vineyardAreaHectares);
  const bottles = formatCount(winery.annualProductionBottles, "ბოთლი");
  const listings = (winery.listings ?? []).map(mapApiProductToListing);
  const gallery = (winery.gallery ?? []).filter(Boolean);
  const description = winery.description?.trim() || "";
  const tagline = winery.tagline?.trim() || "";
  const initial = winery.name.trim().slice(0, 1) || "მ";
  const phone = phoneHref(winery.contact?.phone);
  const phoneLabel = winery.contact?.phone?.trim() || "";
  const email = winery.contact?.email?.trim() || "";
  const website = externalHref(winery.contact?.website);
  const facebook = externalHref(winery.contact?.facebook);
  const instagram = externalHref(winery.contact?.instagram);
  const address = winery.address?.trim() || "";
  const mapLink = mapsHref({
    coordinates: winery.coordinates,
    address,
    microzone: winery.microzone,
    regionLabel,
  });
  const lat = winery.coordinates?.lat;
  const lng = winery.coordinates?.lng;
  const mapEmbed =
    typeof lat === "number" && typeof lng === "number"
      ? `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`
      : null;
  const visitHref = acceptsVisitors ? phone || (email ? `mailto:${email}` : null) : null;

  const methodSummary = methods.join(", ");
  const stats = [
    winery.foundedYear ? { label: "დაარსდა", value: `${winery.foundedYear} წელი` } : null,
    hectares ? { label: "ვენახის ფართობი", value: hectares } : null,
    bottles ? { label: "წლიური წარმოება", value: bottles } : null,
    { label: "მარნის ტიპი", value: WINERY_TYPE_LABELS[winery.wineryType] },
    methodSummary ? { label: "მთავარი მეთოდები", value: methodSummary } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const contacts = [
    phone ? { href: phone, label: phoneLabel, icon: Phone } : null,
    email ? { href: `mailto:${email}`, label: email, icon: Mail } : null,
    website ? { href: website, label: winery.contact?.website?.trim() || website, icon: Globe, external: true } : null,
    facebook ? { href: facebook, label: "Facebook", icon: Facebook, external: true } : null,
    instagram ? { href: instagram, label: "Instagram", icon: Instagram, external: true } : null,
    address ? { href: mapLink || undefined, label: address, icon: MapPin, external: Boolean(mapLink) } : null,
  ].filter(Boolean) as { href?: string; label: string; icon: typeof Phone; external?: boolean }[];

  const showAbout = Boolean(description || methods.length);
  const showColumn = showAbout || grapes.length > 0 || gallery.length > 0;
  const showTourism = acceptsVisitors || services.length > 0 || Boolean(hours);
  const showContact = contacts.length > 0;
  const showSidebar = showTourism || Boolean(mapEmbed || mapLink) || showContact;

  return (
    <div className="mx-auto max-w-7xl py-8">
      <nav aria-label="breadcrumb" className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-[#721c24]">
          მთავარი
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/wineries" className="hover:text-[#721c24]">
          მარნები
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-zinc-800">{winery.name}</span>
      </nav>

      <section className="mt-4">
        <div className="relative h-64 overflow-hidden rounded-none md:rounded-3xl bg-[#efe6df] sm:h-80">
          {winery.coverImage ? (
            <ContentImage
              src={winery.coverImage}
              alt={winery.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#8d3a45] to-[#3d1016]" />
          )}
        </div>

        <div className="relative z-10 -mt-16 rounded-none md:rounded-3xl bg-white p-5 shadow-[0_16px_40px_rgba(60,40,20,0.08)] sm:mx-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#721c24]/30 bg-[#F9F7F5] text-2xl font-semibold text-[#721c24]">
                {winery.logo ? (
                  <ContentImage
                    src={winery.logo}
                    alt={`${winery.name} ლოგო`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-dejavu-sans text-3xl tracking-tight text-zinc-900 sm:text-4xl">{winery.name}</h1>
                  {winery.isVerified && (
                    <span className="rounded-full bg-[#e7f6ee] px-2.5 py-1 text-xs font-medium text-[#1f7a45]">
                      დადასტურებული
                    </span>
                  )}
                </div>
                {place.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-zinc-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]" aria-hidden />
                    <span>{place.join(", ")}</span>
                  </p>
                )}
              </div>
            </div>

            {(tagline || visitHref) && (
              <div className="max-w-sm lg:text-right">
                {tagline && <p className="font-dejavu-sans italic font-bold text-lg leading-7 text-[#665454]">„{tagline}“</p>}
                {visitHref && (
                  <a
                    href={visitHref}
                    className="mt-3 inline-flex rounded-full bg-[#721c24] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5c151c]"
                  >
                    ვიზიტის დაჯავშნა
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {stats.length > 0 && (
        <dl className="mt-5 grid gap-4 rounded-none md:rounded-[28px] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(60,40,20,0.05)] sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="text-xs text-zinc-400">{stat.label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-zinc-900" title={stat.value}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(showColumn || showSidebar) && (
        <div className={`mt-8 grid items-start gap-6 ${showColumn && showSidebar ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
          {showColumn && (
            <div className="space-y-6">
              {showAbout && (
                <section className="rounded-none md:rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(60,40,20,0.05)] sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#b08980]">მეღვინეობა და ხედვა</p>
                      <h2 className="mt-1 font-dejavu-sans text-3xl text-zinc-900">მარნის შესახებ</h2>
                    </div>
                    <Wine className="h-6 w-6 shrink-0 text-[#d9c7b4]" aria-hidden />
                  </div>
                  {description && <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-700">{description}</p>}
                  {methods.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {methods.map((method) => (
                        <li
                          key={method}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f6f1ec] px-3 py-1.5 text-sm text-zinc-700"
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${methodDot(method)}`} aria-hidden />
                          {method}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              {grapes.length > 0 && (
                <section>
                  <div className="flex items-end justify-between gap-4 px-4 md:px-0">
                    <div>
                      {regionLabel && <p className="text-xs text-[#b08980]">{regionLabel}</p>}
                      <h2 className="mt-1 font-dejavu-sans text-3xl text-zinc-900">ყურძნის ჯიშები</h2>
                    </div>
                    <Link href="/encyclopedia" className="shrink-0 text-sm text-[#b08980] hover:text-[#721c24]">
                      სრული ენციკლოპედია →
                    </Link>
                  </div>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {grapes.map((grape) => {
                      const color = grapeColorLabel(grape.color);
                      const latin = grape.slug ? latinNameFromSlug(grape.slug) : "";
                      return (
                        <li key={grape.id} className="rounded-none md:rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(60,40,20,0.04)]">
                          {color && (
                            <p className="inline-flex rounded-full bg-[#f6f1ec] px-2.5 py-1 text-xs text-zinc-500">{color} ჯიში</p>
                          )}
                          <h3 className="mt-3 font-dejavu-sans text-2xl text-zinc-900">
                            {grape.slug ? (
                              <Link href={`/encyclopedia/${grape.slug}`} className="hover:text-[#721c24]">
                                {grape.name || grape.slug}
                                {latin && grape.name ? <span className="text-zinc-400"> / {latin}</span> : null}
                              </Link>
                            ) : (
                              grape.name
                            )}
                          </h3>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              {gallery.length > 0 && (
                <section className="px-4 md:px-0">
                  <h2 className="font-dejavu-sans text-2xl text-zinc-900">გალერეა</h2>
                  <ul className="mt-4 grid grid-cols-2 gap-3">
                    {gallery.map((image, index) => (
                      <li key={`${image}-${index}`} className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-white">
                        <ContentImage
                          src={image}
                          alt={`${winery.name} — სურათი ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {showSidebar && (
            <aside className="space-y-4 lg:sticky lg:top-24">
              {showTourism && (
                <section className="rounded-none md:rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(60,40,20,0.05)]">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    {acceptsVisitors ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#1f7a45]">
                        <span className="h-2 w-2 rounded-full bg-[#3c9a62]" aria-hidden />
                        იღებს სტუმრებს
                      </span>
                    ) : (
                      <span className="text-zinc-500">სტუმრებს ამ ეტაპზე არ იღებს</span>
                    )}
                    {acceptsVisitors && (
                      <span className="text-zinc-400">
                        {winery.tourism?.reservationRequired === false ? "ჯავშანი არ არის სავალდებულო" : "წინასწარ ჯავშანი"}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-dejavu-sans text-2xl leading-tight text-zinc-900">ღვინის ტურიზმი და ვიზიტი</h2>
                  {place.length > 0 && <p className="mt-1 text-sm text-zinc-500">{place.join(", ")}</p>}
                  {services.length > 0 && (
                    <>
                      <p className="mt-5 text-sm text-zinc-500">სერვისები და შეთავაზება</p>
                      <ul className="mt-3 space-y-2.5">
                        {services.map((service) => (
                          <li key={service} className="flex items-start gap-2 text-sm text-zinc-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {hours && (
                    <p className="mt-4 flex items-start gap-2 text-sm text-zinc-700">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                      <span>
                        <span className="text-zinc-500">სამუშაო საათები: </span>
                        {hours}
                      </span>
                    </p>
                  )}
                  {visitHref && (
                    <a
                      href={visitHref}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#721c24] px-4 py-3 text-sm font-medium text-white hover:bg-[#5c151c]"
                    >
                      <Calendar className="h-4 w-4" aria-hidden />
                      დაჯავშნე ვიზიტი / დაკავშირება
                    </a>
                  )}
                </section>
              )}

              {(mapEmbed || mapLink) && (
                <section className="overflow-hidden rounded-none md:rounded-[28px] bg-white shadow-[0_10px_30px_rgba(60,40,20,0.05)]">
                  <div className="relative">
                    {mapEmbed && (
                      <iframe
                        title={`${winery.name} რუკაზე`}
                        src={mapEmbed}
                        className="h-48 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    )}
                    {mapLink && (
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${mapEmbed ? "absolute left-3 top-3 shadow-sm" : "m-3"} inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:text-[#721c24]`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#721c24]" aria-hidden />
                        რუკაზე ნახვა (Google Maps)
                      </a>
                    )}
                  </div>
                </section>
              )}

              {showContact && (
                <section className="rounded-none md:rounded-3xl bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">კონტაქტი</h2>
                  <ul className="mt-4 space-y-3">
                    {contacts.map((contact) => {
                      const Icon = contact.icon;
                      const content = (
                        <>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]" aria-hidden />
                          <span className="min-w-0 break-words">{contact.label}</span>
                        </>
                      );
                      return (
                        <li key={`${contact.label}-${contact.href || "text"}`}>
                          {contact.href ? (
                            <a
                              href={contact.href}
                              {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              className="flex items-start gap-2 text-sm text-zinc-700 hover:text-[#721c24]"
                            >
                              {content}
                            </a>
                          ) : (
                            <p className="flex items-start gap-2 text-sm text-zinc-700">{content}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </aside>
          )}
        </div>
      )}

      {listings.length > 0 && (
        <section className="mt-10 px-4 md:px-0">
          <h2 className="font-dejavu-sans text-2xl text-zinc-900">მარნის განცხადებები</h2>
          <p className="mt-1 text-sm text-zinc-500">ამ მარნის ან მისი მფლობელის აქტიური განცხადებები.</p>
          <div className="mt-4">
            <ListingGrid listings={listings} />
          </div>
        </section>
      )}
    </div>
  );
}
