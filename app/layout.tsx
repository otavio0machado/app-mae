import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Hora Clara · Relatório mensal de horas",
  description: "Seus registros organizados. Seus relatórios prontos.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
