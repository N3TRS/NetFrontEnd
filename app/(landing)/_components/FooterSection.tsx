import { Terminal, Globe, Mail, type LucideIcon } from "lucide-react";


interface SocialLink {
  icon: LucideIcon;
  label: string;
  href: string;
}


const SOCIAL_LINKS: SocialLink[] = [
  { icon: Globe, label: "Website", href: "#" },
  { icon: Terminal, label: "GitHub", href: "#" },
  { icon: Mail, label: "Email", href: "#" },
];


export default function FooterSection() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 border-t border-white/5 px-6 py-12 md:flex-row">
      <div className="flex items-center gap-3 opacity-60">
        <div className="rounded bg-slate-500 p-1 text-background">
          <Terminal className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight">OmniCode</span>
      </div>
      <p className="text-sm text-muted-foreground">
        © 2026 OmniCode. Escuela Colombiana de Ingeniería Julio Garavito
      </p>

      <div className="flex gap-6 opacity-60">
        {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="transition-colors hover:text-primary"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </footer>
  );
}
