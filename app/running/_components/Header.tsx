"use client"
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { LogOut, Terminal, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

export default function HeaderRunnning() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMenuOpen((prev) => !prev);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus-ring rounded-lg"
        >
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold">
            OmniCode
          </span>
        </Link>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ModeToggle />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((prev) => !prev)}
            onKeyDown={handleKeyDown}
            className="focus-ring rounded-full transition-all duration-200 cursor-pointer p-0.5 ring-2 ring-transparent hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-[#0a0e14]"
            aria-label="Menú de usuario"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.email || 'Avatar de usuario'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-10 w-10 text-muted-foreground hover:text-white transition-colors" />
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0d1117] shadow-[0_0_30px_-10px_rgba(0,0,0,0.8)] py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleLogout();
                  } else if (e.key === 'Escape') {
                    setMenuOpen(false);
                    menuButtonRef.current?.focus();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors focus-ring"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



