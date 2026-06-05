import type { Metadata } from "next";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { LandingHero } from "./(public)/lp/components/LandingHero";

export const metadata: Metadata = {
  title: "MultiClinica | Gestão moderna para clínicas",
  description: "SaaS para gestão de clínicas, agenda, pacientes, prontuários, pagamentos e operação administrativa.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8fffc] text-[#0f172a]">
      <LandingHeader />
      <LandingHero />
    </main>
  );
}
