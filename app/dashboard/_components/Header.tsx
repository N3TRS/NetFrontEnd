import { Terminal } from "lucide-react";
import Image from "next/image";
import GithubIcon from "@/public/github-icon-logo.png";
// TODO: -> Agregar el profile pic de github y opciones de ver perfil
export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold">
            OmniCode
          </span>
        </div>
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-8 text-sm font-medium opacity-80 md:flex">
          <a
            href="/dashboard/sessions"
            className="transition-colors hover:text-primary"
          >
            Sesiones
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Image
            src={GithubIcon}
            alt="avatar"
            width={40}
            height={40}
            className="relative inline-block h-10 w-10 rounded-full! cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
}
