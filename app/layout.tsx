import InstallApp from "@/components/install-app";
import type { Metadata, Viewport } from "next";
import "./globals.css";
export const viewport: Viewport = { themeColor: "#3562b5" };
export const metadata: Metadata = {
  title: "Hora Clara · Relatório mensal de horas",
  applicationName: "Hora Clara",
  appleWebApp: { capable: true, title: "Hora Clara", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-180.png" },
  description: "Seus registros organizados. Seus relatórios prontos.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}<InstallApp /></body>
    </html>
  );
}
