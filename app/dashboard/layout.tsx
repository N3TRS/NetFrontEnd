import type { Metadata } from "next";
import NavBar from "./_components/Header";
import AuthGuard from "./_components/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard | OmniCode",
  description: "Gestiona tus sesiones colaborativas y repositorios desde el dashboard de OmniCode.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="grow pb-10">{children}</main>
      </div>
    </AuthGuard>
  );
}
