import "./(public)/lp/landing-enhancements.css";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { LandingExperience } from "./(public)/lp/components/LandingExperience";
import { LandingClients } from "./(public)/lp/components/LandingClients";
import { LandingClinicsShowcase } from "./(public)/lp/components/LandingClinicsShowcase";
import { LandingPatientExperience } from "./(public)/lp/components/LandingPatientExperience";
import { LandingFaq } from "./(public)/lp/components/LandingFaq";
import { LandingCTA } from "./(public)/lp/components/LandingCTA";
import { LandingFooter } from "./(public)/lp/components/LandingFooter";
import { LandingMascot } from "./(public)/lp/components/LandingMascot";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} | A clínica inteira, em uma visão só` },
  description:
    "Cliniq Care: gestão clínica com agenda, pacientes, prontuários, evolução e operação administrativa conectadas — e um portal para o paciente.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | A clínica inteira, em uma visão só`,
    description: "Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | A clínica inteira, em uma visão só`,
    description: "Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
  },
};

export default function HomePage() {
  return (
    <main className="theme-light landing-page min-h-screen overflow-x-clip bg-background text-secondary">
      <LandingHeader />
      <LandingMascot />
      <LandingExperience />
      <LandingClients />
      <LandingPatientExperience />
      <LandingClinicsShowcase />
      <LandingFaq />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
