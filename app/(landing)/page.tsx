import HeroSection from "./_components/HeroSection";
import FeaturesSection from "./_components/FeaturesSection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground selection:bg-primary/30 bg-grid-white">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-125 w-125 rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-150 w-150 rounded-full bg-accent/10 blur-[150px]" />
      <div className="flex flex-col items-center">
        <HeroSection />
        <FeaturesSection />
      </div>
    </div>
  );
}
