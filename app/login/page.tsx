import type { Metadata } from "next";

import LoginShell from "./_components/LoginShell";

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
  return <LoginShell />;
}
