import NavBar from "@/app/dashboard/_components/Header";
import AuthGuard from "@/app/dashboard/_components/AuthGuard";

export default function SessionsLayout({
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
