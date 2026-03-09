import type { Metadata } from "next";
import RegisterShell from "./_components/RegisterShell";

export const metadata: Metadata = {
  title: "Register | OmniCode",
  description: "Create your OmniCode account and start building.",
};

export default function RegisterPage() {
  return <RegisterShell />;
}
