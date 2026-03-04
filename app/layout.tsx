import "./globals.css";

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OmniCode',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-primary">
        {children}
      </body>
    </html>
  );
}
