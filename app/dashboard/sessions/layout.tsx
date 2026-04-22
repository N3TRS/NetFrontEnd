import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sesiones | OmniCode",
  description: "Visualiza y gestiona tus sesiones colaborativas activas.",
};

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
