import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hub de clínicas",
  description: "Encontre clínicas de saúde perto de você e peça seu horário pelo Cliniq Care.",
  alternates: { canonical: "/hub" },
};

// Stub da Fundação: a Trilha F monta a página.
export default function PublicHubPage() {
  return <main className="theme-lp min-h-screen" />;
}
