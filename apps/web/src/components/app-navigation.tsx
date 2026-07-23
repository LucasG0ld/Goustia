"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/accueil", label: "Accueil", shortLabel: "Accueil" },
  { href: "/planning", label: "Planning", shortLabel: "Planning" },
  { href: "/courses", label: "Liste de courses", shortLabel: "Courses" },
  { href: "/favoris", label: "Favoris", shortLabel: "Favoris" },
  { href: "/profil", label: "Profil", shortLabel: "Profil" },
] as const;

export function AppNavigation() {
  const pathname = usePathname();
  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="hidden items-center gap-1 md:flex"
      >
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                active ? "bg-brand-soft text-brand" : "hover:bg-surface-muted"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <nav
        aria-label="Navigation principale mobile"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 items-center justify-center px-1 text-center text-xs font-semibold ${
                active ? "text-brand" : "text-muted"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.shortLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
