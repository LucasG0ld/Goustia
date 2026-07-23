import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Recette introuvable</h1>
      <p className="mt-3 text-muted">
        Cette recette n’existe pas ou n’est pas accessible.
      </p>
      <Link
        className="mt-6 inline-block font-semibold text-brand"
        href="/accueil"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
