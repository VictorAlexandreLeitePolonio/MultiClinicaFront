"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessSuperAdmin } from "@/lib/auth/routes";
import { SuperAdminShell } from "@/components/layout/SuperAdminShell";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && !canAccessSuperAdmin(user.role)) {
      router.replace("/access-denied");
    }
  }, [pathname, router, user]);

  if (!user || !canAccessSuperAdmin(user.role)) return null;

  return <SuperAdminShell>{children}</SuperAdminShell>;
}
