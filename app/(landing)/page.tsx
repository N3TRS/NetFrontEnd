import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import FeaturesSection from "./_components/FeaturesSection";
import FooterSection from "./_components/FooterSection";

/**
 * Landing page - thin orchestrator.
 * All sections are server components; no client bundle cost.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground selection:bg-primary/30 bg-grid-white">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-accent/10 blur-[150px]" />

      <Navbar />

      <div className="flex flex-col items-center">
        <HeroSection />
        <FeaturesSection />
        <FooterSection />
      </div>
    </div>
  );
}