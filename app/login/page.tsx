import type { Metadata } from "next";

import LoginShell from "./_components/LoginShell";

export const metadata: Metadata = {
  title: "Sign In | OmniCode",
  description: "Sign in to your OmniCode account to access your workspace.",
};

export default function LoginPage() {
  return <LoginShell />;
}
