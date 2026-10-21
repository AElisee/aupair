import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorks from "@/components/home/HowItWorks";
import CountriesSection from "@/components/home/CountriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogPreview from "@/components/home/BlogPreview";
import CtaBanner from "@/components/home/CtaBanner";
import { getAppSettings } from "@/lib/settings";
import { getPublicStats } from "@/lib/public-stats";
import { getPublishedTestimonials } from "@/lib/testimonials";

// Compteurs d'inscrits et avis publiés lus à chaque visite.
export const dynamic = "force-dynamic";

const HOME_TESTIMONIALS = 3;

export default async function HomePage() {
  const [{ heroImageUrl }, counts, testimonials] = await Promise.all([
    getAppSettings(),
    getPublicStats(),
    getPublishedTestimonials(HOME_TESTIMONIALS),
  ]);

  return (
    <>
      <HeroSection heroImageUrl={heroImageUrl} />
      <StatsSection counts={counts} />
      <HowItWorks />
      <CountriesSection />
      <TestimonialsSection testimonials={testimonials} />
      <BlogPreview />
      <CtaBanner />
    </>
  );
}
