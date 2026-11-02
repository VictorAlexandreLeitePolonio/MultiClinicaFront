import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { SmoothScroll } from "./(public)/lp/components/SmoothScroll";
import { LandingHeader } from "./(public)/lp/components/LandingHeader";
import { HeroSection } from "./(public)/lp/components/hero/HeroSection";
import { FeaturesSection } from "./(public)/lp/components/features/FeaturesSection";
import { IntegrationSection } from "./(public)/lp/components/features/IntegrationSection";
import { HubSection } from "./(public)/lp/components/hub/HubSection";
import { LandingPricing } from "./(public)/lp/components/LandingPricing";
import { LandingFaq } from "./(public)/lp/components/LandingFaq";
import { LandingCTA } from "./(public)/lp/components/LandingCTA";
import { LandingFooter } from "./(public)/lp/components/LandingFooter";

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
    <SmoothScroll>
      <main className="theme-lp min-h-screen overflow-x-clip">
        <LandingHeader />
        <HeroSection />
        <FeaturesSection />
        <IntegrationSection />
        <HubSection />
        <LandingPricing />
        <LandingFaq />
        <LandingCTA />
        <LandingFooter />
      </main>
    </SmoothScroll>
  );
}
