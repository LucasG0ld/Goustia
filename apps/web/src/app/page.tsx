import { nutritionGoals } from "@recettes/domain";

const foundations = [
  {
    title: "Tes goûts",
    detail: "Like, dislike ou remplace un plat pour affiner les propositions.",
  },
  {
    title: "Tes contraintes",
    detail: "Les allergies et exclusions passent toujours avant les envies.",
  },
  {
    title: "Ta semaine",
    detail: "Retrouve tes repas et leurs recettes dans un planning simple.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Goustia
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          Des repas qui apprennent tes goûts, semaine après semaine.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Indique l&apos;essentiel, découvre ton planning et ajuste chaque
          proposition sans questionnaire interminable.
        </p>
      </div>

      <section
        aria-label="Principes de Goustia"
        className="mt-12 grid gap-4 md:grid-cols-3"
      >
        {foundations.map((foundation) => (
          <article
            key={foundation.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-semibold text-slate-950">{foundation.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{foundation.detail}</p>
          </article>
        ))}
      </section>

      <p className="mt-8 text-sm text-slate-500">
        {nutritionGoals.length} profils alimentaires non médicaux seront
        disponibles au lancement.
      </p>
    </main>
  );
}
