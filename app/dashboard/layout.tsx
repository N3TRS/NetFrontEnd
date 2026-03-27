import NavBar from "./_components/Header"
import FooterSection from "../(landing)/_components/FooterSection"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="grow pb-10">{children}</main>
      <FooterSection />
    </div>
  )
}
