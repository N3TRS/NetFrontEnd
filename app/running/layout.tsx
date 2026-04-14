import HeaderRunnning from "./_components/Header"

export default function RunningLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-screen flex-col transition-theme">
      <HeaderRunnning />
      <main className="grow pb-10">{children}</main>
    </div>
  )

}
