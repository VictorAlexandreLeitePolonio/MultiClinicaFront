import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { ClientProviders } from "@/providers/ClientProviders";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProjetoLP — Clínica de Fisioterapia",
  description: "Sistema de gestão da clínica",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geist.className} min-h-full antialiased`}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
