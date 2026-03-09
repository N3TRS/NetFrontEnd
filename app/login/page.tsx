import type { Metadata } from "next";
import { Terminal } from "lucide-react";

import AuthCharacters from "./_components/AuthCharacters";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | OmniCode",
  description: "Sign in to your OmniCode account to access your workspace.",
};

/**
 * LoginPage — Server Component (default in App Router).
 *
 * Thin orchestrator: owns the split-screen shell layout and composes the two
 * client-side feature islands (AuthCharacters, LoginForm). Zero client JS
 * shipped from this file itself.
 */
export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ────────────────────────────────────────────────────────────────────
          Left panel: branded visual with animated mascots (desktop only)
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-primary/10 lg:flex"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,139,16,0.07), transparent 60%)," +
            "radial-gradient(circle at bottom left, rgba(90,24,154,0.10), transparent 60%)," +
            "#09080d",
        }}
      >
        {/* Soft ambient blob */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        {/* Bottom fade into background */}
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-background/90 to-transparent" />

        <AuthCharacters />
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Right panel: login form (full-width on mobile, half on desktop)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto p-8 sm:p-12 md:p-24 lg:w-1/2">
        {/* Mobile-only logo (hidden on lg+ because left panel carries the brand) */}
        <div className="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
          <Terminal className="size-7 text-primary" />
          <span className="text-xl font-bold">OmniCode</span>
        </div>

        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>

        {/* Language selector — decorative, bottom-right corner */}
        <div className="absolute bottom-8 right-8 flex items-center gap-1.5 text-xs text-slate-500">
          <Terminal className="size-3.5" />
          <span>English (US)</span>
        </div>
      </div>
    </div>
  );
}
