import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { LandingHeader } from "../lp/components/LandingHeader";
import { LandingFooter } from "../lp/components/LandingFooter";
import { HubPageContent } from "./HubPageContent";

export const metadata: Metadata = {
  title: "Hub de clínicas",
  description: "Encontre clínicas de saúde perto de você e peça seu horário pelo Cliniq Care.",
  alternates: { canonical: "/hub" },
};

export default function PublicHubPage() {
  return (
    <main className="theme-lp min-h-screen overflow-x-clip">
      <LandingHeader />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-[88rem] px-6 pb-20 pt-28 lg:px-8 lg:pt-32">
            <Skeleton className="h-12 w-80 max-w-full" />
            <Skeleton className="mt-4 h-5 w-full max-w-xl" />
            <Skeleton className="mt-10 h-40 w-full" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-72" />
              ))}
            </div>
          </div>
        }
      >
        <HubPageContent />
      </Suspense>
      <LandingFooter />
    </main>
  );
}
