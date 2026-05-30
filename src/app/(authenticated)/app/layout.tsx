"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessClinicApp } from "@/lib/auth/routes";
import { AppShell } from "@/components/layout/AppShell";

interface ClinicAppLayoutProps {
  children: ReactNode;
}

export default function ClinicAppLayout({ children }: ClinicAppLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && !canAccessClinicApp(user.role)) {
      router.replace("/access-denied");
    }
  }, [pathname, router, user]);

  if (!user || !canAccessClinicApp(user.role)) return null;

  return <AppShell>{children}</AppShell>;
}
