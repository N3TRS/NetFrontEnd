export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <header className="bg-primary py-3 px-6">
          <nav>
            <ul className="flex justify-between items-center">
              <li>
                <a className="font-bold text-white">OmniCode</a>
              </li>
              <li>
                <ul className="flex items-center gap-4">
                  <li>
                    <a className="text-gray-400 px-3 flex items-center" href="/documentation">Documentacion</a>
                  </li>
                  <li>
                    <a className="text-gray-400 px-3 flex items-center" href="/features">Caracteristicas</a>
                  </li>
                  <li className="px-3">
                    <button className="font-semibold cursor-pointer bg-cards text-white rounded-xl flex items-center py-3 px-3 hover:scale-105 transition-transform">
                      Iniciar Sesion
                    </button>
                  </li>
                  <li className="px-3">
                    <button className="font-semibold cursor-pointer bg-primary-action text-white rounded-xl flex items-center py-3 px-3 hover:scale-105 transition-transform">
                      Registrarse
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </header>
        <div className="h-0.5 w-full bg-gray-500"></div>
        <div ></div>
        <main>
          {children}
        </main>
        <div className="h-0.5 w-full bg-gray-500"></div>
        <footer>
          <ul className="px-3 text-gray-400 flex justify-between items-center">
            <li>
              OmniCode @ 2026-1
            </li>
            <li>
              <a className="text-gray-400 px-3 flex items-center" href="https://github.com/N3TRS"> Github </a>
            </li>
          </ul>
        </footer>
      </body>
    </html >
  )
}



