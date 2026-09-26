import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Aceitar convite",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function InvitationLayout({ children }: { children: ReactNode }) {
  return children;
}
