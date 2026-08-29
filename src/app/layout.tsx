import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ClientProviders } from "@/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cliniq",
  description: "Cliniq — a clínica, inteligente. Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">
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
