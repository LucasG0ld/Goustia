import { Skeleton } from "@/components/ui";

export default function AuthenticatedLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la semaine"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <Skeleton className="h-10 w-72" />
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </main>
  );
}
