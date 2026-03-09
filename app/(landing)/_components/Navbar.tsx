import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = ["Features", "Docs"] as const;
type NavLink = (typeof NAV_LINKS)[number];

/**
 * Sticky top navigation bar — server component (no client interactivity needed).
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">OmniCode</span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm font-medium opacity-80 md:flex">
          {NAV_LINKS.map((link: NavLink) => (
            <a
              key={link}
              href="#"
              className="transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Button asChild className="glow-purple bg-accent text-accent-foreground font-bold hover:brightness-110 hover:scale-105 transition-all px-5 py-2.5 text-sm rounded-lg border-0">
            <Link href="/login">Log In</Link>
          </Button>
          <Button className="glow-orange bg-primary text-primary-foreground font-bold hover:brightness-110 hover:scale-105 transition-all px-5 py-2.5 text-sm rounded-lg border-0">
            Registrarse
          </Button>
        </div>
      </div>
    </header>
  );
}
