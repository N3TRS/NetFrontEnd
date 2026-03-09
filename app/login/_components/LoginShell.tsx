"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";

import AuthCharacters from "./AuthCharacters";
import LoginForm from "./LoginForm";

/**
 * LoginShell — Client Component.
 *
 * Owns the shared interaction state that bridges the form (right panel)
 * and the animated characters (left panel):
 *  - isTyping       : user is focused on the email input
 *  - isPasswordVisible : user toggled password visibility
 *  - hasPassword    : password field is non-empty
 *
 * This is the only place where state needs to cross the left/right boundary;
 * both children are pure "display" components that accept props.
 */
export default function LoginShell() {
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

      {/* ── Right panel: login form ── */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto p-8 sm:p-12 md:p-24 lg:w-1/2">
        {/* Mobile-only logo */}
        <div className="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
          <Terminal className="size-7 text-primary" />
          <span className="text-xl font-bold">OmniCode</span>
        </div>

        <div className="w-full max-w-[400px]">
          <LoginForm
            onTypingChange={setIsTyping}
            onPasswordVisibilityChange={setIsPasswordVisible}
            onPasswordChange={(val) => setHasPassword(val.length > 0)}
          />
        </div>
      </div>
    </div>
  );
}
