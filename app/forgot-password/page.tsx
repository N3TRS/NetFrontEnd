import type { Metadata } from "next";

import ForgotPasswordShell from "./_components/ForgotPasswordShell";

export const metadata: Metadata = {
  title: "Forgot Password | OmniCode",
  description: "Recupera el acceso a tu cuenta OmniCode.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordShell />;
}
