"use client";

import { FormEvent, useId, useState, type ReactNode } from "react";
import { submitContact } from "@/lib/api";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

const EMAIL = "info@wineo.ge";
const PHONE_DISPLAY = "+995 591 170 265";
const PHONE_HREF = "tel:+995591170265";
const MESSAGE_MAX = 1500;

const TOPICS = [
  { value: "general", label: "ზოგადი კითხვა" },
  { value: "partnership", label: "თანამშრომლობა" },
  { value: "winery", label: "მარნის რეგისტრაცია" },
  { value: "listing", label: "განცხადება ან პროდუქტი" },
  { value: "support", label: "ტექნიკური მხარდაჭერა" },
  { value: "marketing", label: "მარკეტინგი და მედია" },
] as const;

const SOCIALS = [
  {
    href: "https://www.facebook.com/wineo.ge",
    label: "Facebook",
    handle: "@wineo.ge",
    icon: Facebook,
    color: "#1877F2",
  },
  {
    href: "https://www.instagram.com/wineo.ge",
    label: "Instagram",
    handle: "@wineo.ge",
    icon: Instagram,
    color: "#E1306C",
  },
  {
    href: "https://www.youtube.com/@georgianvineyard",
    label: "YouTube",
    handle: "@georgianvineyard",
    icon: Youtube,
    color: "#FF0000",
  },
] as const;

const fieldClass =
  "min-w-0 w-full rounded-xl border border-transparent bg-[#f6f3ef] px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--wineo-red)]/25 focus:bg-white focus:ring-2 focus:ring-[var(--wineo-red)]/15 disabled:cursor-not-allowed disabled:opacity-70";

type FormState = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
  consent: false,
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "შეიყვანეთ სახელი და გვარი";
  const email = form.email.trim();
  if (!email) errors.email = "შეიყვანეთ ელფოსტა";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "შეიყვანეთ სწორი ელფოსტა";
  if (!form.topic) errors.topic = "აირჩიეთ მიმართულება";
  const message = form.message.trim();
  if (!message) errors.message = "შეიყვანეთ შეტყობინება";
  else if (message.length > MESSAGE_MAX) {
    errors.message = "შეტყობინება არ უნდა აღემატებოდეს 1500 სიმბოლოს";
  }
  if (!form.consent) errors.consent = "დაეთანხმეთ კონფიდენციალურობის პოლიტიკას";
  return errors;
}

export function ContactView({ privacyHref }: { privacyHref: string | null }) {
  const formId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(false);
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const requestWinery = () => {
    set("topic", "winery");
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess(false);
      return;
    }

    const subject = TOPICS.find((topic) => topic.value === form.topic)?.label ?? form.topic;
    const phone = form.phone.trim();

    setSubmitting(true);
    try {
      await submitContact({
        fullName: form.name.trim(),
        email: form.email.trim(),
        ...(phone ? { phone } : {}),
        subject,
        message: form.message.trim(),
        agreedToPolicy: true,
      });
      setForm(emptyForm);
      setErrors({});
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
      const message = err instanceof Error ? err.message.trim() : "";
      const isNetwork = err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message);
      setSubmitError(
        !message || isNetwork
          ? "შეტყობინების გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით."
          : message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-0 lg:py-12">
      <h1 className="sr-only">კონტაქტი</h1>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-[28px] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(28,25,23,0.45)] ring-1 ring-black/[0.03] sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--wineo-red)]" aria-hidden />
              კორპორატიული საკონტაქტო არხები
            </h2>
            <ul className="mt-5 space-y-5">
              <ContactRow
                icon={Mail}
                label="ელფოსტა"
                value={EMAIL}
                href={`mailto:${EMAIL}`}
                hint="ოფიციალური კორესპონდენცია"
              />
              <ContactRow
                icon={Phone}
                label="ტელეფონი"
                value={PHONE_DISPLAY}
                href={PHONE_HREF}
                hint="ორშაბათი – პარასკევი: 10:00 – 19:00"
              />
              <ContactRow
                icon={MapPin}
                label="მისამართი"
                value="თბილისი, საქართველო"
                hint="ღვინის აღმართი, ისტორიული უბანი"
              />
            </ul>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(28,25,23,0.45)] ring-1 ring-black/[0.03] sm:p-6">
            <h2 className="text-base font-semibold text-zinc-900">გამოგვყევით სოციალურ ქსელებში</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              გაიგეთ ქართული მეღვინეობის უახლესი ამბები, რეგიონის მიმოხილვები და ახალი მარნების პრეზენტაციები.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SOCIALS.map(({ href, label, handle, icon: Icon, color }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full items-center gap-3 rounded-2xl border border-[#efe8e2] bg-[#fbfaf8] px-3 py-3 transition hover:border-[#e4d9d2] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)]"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-black/[0.04]"
                      style={{ color }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-zinc-900">{label}</span>
                      <span className="block text-xs leading-4 text-zinc-500 break-all">{handle}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[28px] bg-[#f8efe8] p-5 ring-1 ring-[#eadfd6] sm:p-6">
            <p className="text-xs font-semibold tracking-wide text-[#8a4b46]">
              მარკეტინგი და მარნის რეგისტრაცია
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-snug text-zinc-900">
              ხართ მარნის მფლობელი ან მეღვინე?
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              დაამატეთ თქვენი მარანი WINEO-ს ერთიან ეროვნულ კატალოგში, მიიღეთ მეტი ვიზიტორი და ღვინის შეკვეთა პირდაპირ მომხმარებლისგან.
            </p>
            <button
              type="button"
              onClick={requestWinery}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--wineo-red)] transition hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2"
            >
              მოითხოვეთ მარნის რეგისტრაცია
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </section>
        </div>

        <section
          id="contact-form"
          className="min-w-0 scroll-mt-24 rounded-[28px] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(28,25,23,0.45)] ring-1 ring-black/[0.03] sm:p-8"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-[1.75rem]">
            მოგვწერეთ შეტყობინება
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            შეავსეთ ფორმა და ჩვენი გუნდი ნებისმიერ კითხვაზე დაგიკავშირდებათ.
          </p>

          {success ? (
            <div className="mt-6 rounded-2xl bg-[#4caf5030] px-4 py-3 text-sm leading-6 text-zinc-800" role="status">
              შეტყობინება გაიგზავნა. მალე დაგიკავშირდებით.
            </div>
          ) : null}
          {submitError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
              {submitError}
            </div>
          ) : null}

            <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate aria-busy={submitting}>
              <Field label="სახელი და გვარი" htmlFor={`${formId}-name`} required error={errors.name}>
                <input
                  id={`${formId}-name`}
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="მაგ: გიორგი ბერიძე"
                  aria-invalid={Boolean(errors.name)}
                  disabled={submitting}
                  className={fieldClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="ელფოსტა" htmlFor={`${formId}-email`} required error={errors.email}>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => set("email", event.target.value)}
                    placeholder="giorgi@example.com"
                    aria-invalid={Boolean(errors.email)}
                    disabled={submitting}
                    className={fieldClass}
                  />
                </Field>
                <Field label="ტელეფონის ნომერი" htmlFor={`${formId}-phone`} error={errors.phone}>
                  <input
                    id={`${formId}-phone`}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    placeholder="+995 5XX XX XX XX"
                    aria-invalid={Boolean(errors.phone)}
                    disabled={submitting}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <Field label="მიმართულება / თემა" htmlFor={`${formId}-topic`} required error={errors.topic}>
                <div className="relative">
                  <select
                    id={`${formId}-topic`}
                    name="topic"
                    value={form.topic}
                    onChange={(event) => set("topic", event.target.value)}
                    aria-invalid={Boolean(errors.topic)}
                    disabled={submitting}
                    className={`${fieldClass} appearance-none pr-10 ${form.topic ? "text-zinc-900" : "text-zinc-400"}`}
                  >
                    <option value="">აირჩიეთ მიმართულება</option>
                    {TOPICS.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Field>

              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label htmlFor={`${formId}-message`} className="text-sm font-medium text-zinc-800">
                    შეტყობინება <span className="text-[var(--wineo-red)]">*</span>
                  </label>
                  <span className={`text-xs ${form.message.length > MESSAGE_MAX ? "text-[var(--wineo-red)]" : "text-zinc-400"}`}>
                    {form.message.length} / {MESSAGE_MAX}
                  </span>
                </div>
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={6}
                  maxLength={MESSAGE_MAX}
                  value={form.message}
                  onChange={(event) => set("message", event.target.value)}
                  placeholder="დაგვიწერეთ დეტალურად თქვენი კითხვის ან შეთავაზების შესახებ..."
                  aria-invalid={Boolean(errors.message)}
                  disabled={submitting}
                  className={`${fieldClass} min-h-36 resize-y disabled:opacity-70`}
                />
                {errors.message ? <p className="mt-1.5 text-xs text-[var(--wineo-red)]">{errors.message}</p> : null}
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm leading-6 text-zinc-600">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => set("consent", event.target.checked)}
                    disabled={submitting}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 accent-[var(--wineo-red)]"
                  />
                  <span>
                    ვეთანხმები პლატფორმის{" "}
                    {privacyHref ? (
                      <a
                        href={privacyHref}
                        className="font-medium text-[var(--wineo-red)] underline decoration-[var(--wineo-red)]/40 underline-offset-2 hover:decoration-[var(--wineo-red)]"
                      >
                        კონფიდენციალურობის პოლიტიკას
                      </a>
                    ) : (
                      <span className="font-medium text-[var(--wineo-red)]">კონფიდენციალურობის პოლიტიკას</span>
                    )}{" "}
                    და თანახმა ვარ ჩემი მონაცემების დამუშავებაზე.
                  </span>
                </label>
                {errors.consent ? <p className="mt-1.5 text-xs text-[var(--wineo-red)]">{errors.consent}</p> : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full float-right cursor-pointer bg-[var(--wineo-red)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f0424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wineo-red)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "იგზავნება..." : "შეტყობინების გაგზავნა"}
                {submitting ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </form>
        </section>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const valueNode = href ? (
    <a href={href} className="font-semibold text-zinc-900 hover:text-[var(--wineo-red)]">
      {value}
    </a>
  ) : (
    <p className="font-semibold text-zinc-900">{value}</p>
  );

  return (
    <li className="flex items-start gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8eef1] text-[var(--wineo-red)]">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs text-zinc-400">{label}</p>
        {valueNode}
        <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>
      </div>
    </li>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
        {required ? <span className="text-[var(--wineo-red)]"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-[var(--wineo-red)]">{error}</p> : null}
    </div>
  );
}
