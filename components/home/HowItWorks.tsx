const STEPS = [
  {
    title: "დამატება",
    description: "შექმენით თქვენი პროდუქციის, მიწის ან აქსესუარების ჩამონათვალი. მიუთითეთ თქვენი ფასი და რეგიონი.",
  },
  {
    title: "დაუკავშირდით მყიდველებსა და დამქირავებლებს",
    description: "მყიდველებსა და დამქირავებლებს შეეძლებათ მარტივად მოძებნონ თქვენი განცხადებები. თქვენ მიიღებთ შეტყობინებებს და გაეცნობით დეტალებს.",
  },
  {
    title: "დაასრულეთ გარიგება",
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
        <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight wineo-red sm:text-3xl">
          როგორ მუშაობს
        </h2>
        <p className="mt-2 text-zinc-600">
           შექმენით განცხადება, დაუკავშირდით მყიდველებსა და დამქირავებლებს და უსაფრთხოდ დადეთ გარიგება.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-zinc-200 bg-white p-6"
            >
              <span
                className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full wineo-red-bg text-sm font-bold text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
