import { nutritionGoals } from "@recettes/domain";

const foundations = [
  {
    title: "Web",
    detail: "Next.js, React, TypeScript et Tailwind CSS",
  },
  {
    title: "Données",
    detail: "PostgreSQL, authentification et stockage avec Supabase",
  },
  {
    title: "Mobile",
    detail: "Expo et React Native, sur le même socle métier",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Socle technique initialisé
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          Des recettes qui apprennent vraiment à vous connaître.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          La base web est prête pour construire l&apos;inscription courte, le
          planning personnalisé et les recommandations sécurisées.
        </p>
      </div>

      <section
        aria-label="Fondations techniques"
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
        {nutritionGoals.length} objectifs nutritionnels sont déjà définis dans
        le domaine partagé.
      </p>
    </main>
  );
}
