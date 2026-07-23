import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { WebVitalsReporter } from "@/components/observability/web-vitals-reporter";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goustia",
  description: "Des repas qui apprennent tes goûts, semaine après semaine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#contenu-principal">
          Aller au contenu principal
        </a>
        {children}
        <footer className="mt-auto border-t bg-surface px-6 py-6 text-sm text-muted">
          <nav
            aria-label="Informations légales"
            className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2"
          >
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/conditions-utilisation">Conditions d’utilisation</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/cookies">Traceurs</Link>
            <Link href="/avertissement">Sécurité et nutrition</Link>
          </nav>
        </footer>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
