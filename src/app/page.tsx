import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorks from "@/components/home/HowItWorks";
import CountriesSection from "@/components/home/CountriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogPreview from "@/components/home/BlogPreview";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <CountriesSection />
      <TestimonialsSection />
      <BlogPreview />
      <CtaBanner />
    </>
  );
}
