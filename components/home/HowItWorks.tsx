const STEPS = [
  {
    title: "დამატება",
    description: "შექმენით თქვენი აღჭურვილობის, მიწის ან ბოთლების ჩამონათვალი. დააყენეთ თქვენი ფასი და რეგიონი.",
  },
  {
    title: "დაუკავშირდით მყიდველებსა და დამქირავებლებს",
    description: "მყიდველებსა და დამქირავებლებს თქვენი ჩამონათვალი მოიძებნება. თქვენ მიიღებთ შეტყობინებებს და გაეცნობით დეტალებს.",
  },
  {
    title: "დაასრულეთ გარიგებაl",
    description: "შეხვდით ან გააგზავნეთ, შეთანხმდით პირობებზე და უსაფრთხოდ დადეთ გარიგება.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      className="border-b border-zinc-200 bg-zinc-50/50 py-14 sm:py-18"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          როგორ მუშაობს
        </h2>
        <p className="mt-2 text-zinc-600">
          ჩამონათვალი, დაუკავშირდით და დაასრულეთ თქვენი გარიგება სამ ნაბიჯზე.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <span
                className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 text-zinc-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
