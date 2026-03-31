import FooterSection from "./_components/FooterSection";
import NavBar from "./_components/Navbar";
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main>{children}</main>
      <FooterSection />
    </div>
  );
}
