import type { Metadata } from "next";
import "./globals.css";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "AuPair A.EU — Trouvez un au pair africain ou une famille d'accueil",
    template: "%s | AuPair A.EU",
  },
  description: "La première plateforme mondiale dédiée aux au pairs africains. Connectez-vous avec des familles en France, Allemagne, Belgique, Luxembourg, Suisse et aux États-Unis.",
  keywords: ["au pair africain", "famille accueil", "au pair Cameroun", "au pair France", "jeune au pair"],
  authors: [{ name: "BODOU SERVICE" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://aupair-aeu.com",
    siteName: "AuPair A.EU",
    title: "AuPair A.EU — La plateforme des au pairs africains",
    description: "Première plateforme mondiale dédiée aux au pairs africains. Trouvez votre famille d'accueil idéale en Europe et en Amérique.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuPair A.EU",
    description: "La première plateforme pour au pairs africains",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-dvh flex flex-col">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
