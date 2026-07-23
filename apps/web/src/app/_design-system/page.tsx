import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignSystemGallery } from "./design-system-gallery";

export const metadata: Metadata = {
  title: "Design system · Goustia",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DesignSystemGallery />;
}
