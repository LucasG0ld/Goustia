import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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
        <WebVitalsReporter />
      </body>
    </html>
  );
}
