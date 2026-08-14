import type { Metadata } from "next";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { LandingExperience } from "./(public)/lp/components/LandingExperience";
import { LandingClients } from "./(public)/lp/components/LandingClients";
import { LandingTestimonials } from "./(public)/lp/components/LandingTestimonials";
import { LandingFaq } from "./(public)/lp/components/LandingFaq";
import { LandingCTA } from "./(public)/lp/components/LandingCTA";
import { LandingFooter } from "./(public)/lp/components/LandingFooter";
import { LandingMascot } from "./(public)/lp/components/LandingMascot";

export const metadata: Metadata = {
  title: "MultiClinica | A clínica inteira, em uma visão só",
  description: "Gestão clínica com agenda, pacientes, prontuários, evolução e operação administrativa conectadas.",
};

export default function HomePage() {
  return (
    <main className="landing-page min-h-screen overflow-x-clip bg-background text-secondary">
      <LandingHeader />
      <LandingMascot />
      <LandingExperience />
      <LandingClients />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
