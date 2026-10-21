import type { Metadata } from "next";
import TemoignagesContent from "./TemoignagesContent";
import { getPublishedTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avis — AuPair A.EU",
  description: "Au pairs africains, familles d'accueil et visiteurs partagent leur avis sur AuPair A.EU.",
};

export default async function TemoignagesPage() {
  const testimonials = await getPublishedTestimonials();
  return <TemoignagesContent testimonials={testimonials} />;
}
