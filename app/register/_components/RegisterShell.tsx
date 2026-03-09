"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";

import AuthCharacters from "@/app/login/_components/AuthCharacters";
import RegistrationForm from "./RegistrationForm";

export default function RegisterShell() {
  const [isTyping, setIsTyping] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ── Left panel: animated mascots (desktop only) ── */}
      <div
        className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-primary/10 lg:flex"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,139,16,0.07), transparent 60%)," +
            "radial-gradient(circle at bottom left, rgba(90,24,154,0.10), transparent 60%)," +
            "#09080d",
        }}
      >
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-background/90 to-transparent" />

        <AuthCharacters
          isTyping={isTyping}
          isPasswordVisible={isPasswordVisible}
          hasPassword={hasPassword}
        />
      </div>

      {/* ── Right panel: registration form ── */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto p-8 sm:p-12 md:p-24 lg:w-1/2">
        {/* Mobile-only logo */}
        <div className="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
          <Terminal className="size-7 text-primary" />
          <span className="text-xl font-bold">OmniCode</span>
        </div>

        <div className="w-full max-w-[400px]">
          <h1 className="mb-8 text-3xl font-bold text-white text-center">Registrate en OmniCode</h1>
          <RegistrationForm
            onTypingChange={setIsTyping}
            onPasswordVisibilityChange={setIsPasswordVisible}
            onPasswordChange={(val) => setHasPassword(val.length > 0)}
          />
        </div>
      </div>
    </div>
  );
}
