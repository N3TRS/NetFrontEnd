import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor | OmniCode",
  description: "Editor colaborativo multi-lenguaje con sincronización en tiempo real y asistente IA.",
};

export default function CodeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
