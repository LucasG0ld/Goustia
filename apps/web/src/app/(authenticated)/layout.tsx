import Link from "next/link";

import { AppNavigation } from "@/components/app-navigation";
import { requireVerifiedUser } from "@/lib/auth/current-user";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireVerifiedUser();
  return (
    <div className="min-h-full pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link
            className="text-lg font-bold tracking-[0.12em] text-brand"
            href="/accueil"
          >
            Goustia
          </Link>
          <AppNavigation />
        </div>
      </header>
      {children}
    </div>
  );
}
