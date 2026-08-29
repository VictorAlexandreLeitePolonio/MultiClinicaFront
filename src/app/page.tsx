import type { Metadata } from "next";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { LandingExperience } from "./(public)/lp/components/LandingExperience";
import { LandingClients } from "./(public)/lp/components/LandingClients";
import { LandingClinicsShowcase } from "./(public)/lp/components/LandingClinicsShowcase";
import { LandingTestimonials } from "./(public)/lp/components/LandingTestimonials";
import { LandingFaq } from "./(public)/lp/components/LandingFaq";
import { LandingCTA } from "./(public)/lp/components/LandingCTA";
import { LandingFooter } from "./(public)/lp/components/LandingFooter";
import { LandingMascot } from "./(public)/lp/components/LandingMascot";

export const metadata: Metadata = {
  title: { absolute: "Cliniq | A clínica inteira, em uma visão só" },
  description:
    "Gestão clínica com agenda, pacientes, prontuários, evolução e operação administrativa conectadas — e um portal para o paciente.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cliniq | A clínica inteira, em uma visão só",
    description: "Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <main className="theme-light landing-page min-h-screen overflow-x-clip bg-background text-secondary">
      <LandingHeader />
      <LandingMascot />
      <LandingExperience />
      <LandingClients />
      <LandingClinicsShowcase />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
