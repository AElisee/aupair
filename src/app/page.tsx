import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorks from "@/components/home/HowItWorks";
import CountriesSection from "@/components/home/CountriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogPreview from "@/components/home/BlogPreview";
import CtaBanner from "@/components/home/CtaBanner";
import { getAppSettings } from "@/lib/settings";

export default async function HomePage() {
  const { heroImageUrl } = await getAppSettings();

  return (
    <>
      <HeroSection heroImageUrl={heroImageUrl} />
      <StatsSection />
      <HowItWorks />
      <CountriesSection />
      <TestimonialsSection />
      <BlogPreview />
      <CtaBanner />
    </>
  );
}
