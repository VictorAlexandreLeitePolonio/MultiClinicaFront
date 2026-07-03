import type { Metadata } from "next";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { LandingHero } from "./(public)/lp/components/LandingHero";
import { LandingClients } from "./(public)/lp/components/LandingClients";
import { LandingFeatures } from "./(public)/lp/components/LandingFeatures";
import { LandingTestimonials } from "./(public)/lp/components/LandingTestimonials";
import { LandingCTA } from "./(public)/lp/components/LandingCTA";
import { LandingFooter } from "./(public)/lp/components/LandingFooter";

export const metadata: Metadata = {
  title: "MultiClinica | Gestão moderna para clínicas",
  description: "SaaS para gestão de clínicas, agenda, pacientes, prontuários, pagamentos e operação administrativa.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-secondary">
      <LandingHeader />
      <LandingHero />
      <LandingClients />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
