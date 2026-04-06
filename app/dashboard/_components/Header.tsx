"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, UserCircle, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/_hooks/useAuth";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold">
            OmniCode
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-8 text-sm font-medium opacity-80 md:flex">
          <a href="/dashboard/sessions" className="transition-colors hover:text-primary">
            Sesiones
          </a>
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="cursor-pointer rounded-full focus:outline-none"
            aria-label="Menú de usuario"
          >
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.email}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-10 w-10 text-muted-foreground" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-65 rounded-xl border border-white/10 bg-[#0d1117] shadow-[0_0_30px_-10px_rgba(0,0,0,0.8)] py-1">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
