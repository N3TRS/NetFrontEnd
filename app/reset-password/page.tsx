import type { Metadata } from "next";

import ResetPasswordShell from "./_components/ResetPasswordShell";

export const metadata: Metadata = {
  title: "Reset Password | OmniCode",
  description: "Establece una nueva contraseña para tu cuenta OmniCode.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordShell />;
}
