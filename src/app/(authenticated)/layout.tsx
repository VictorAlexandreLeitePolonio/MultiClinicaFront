"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, initialLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialLoading, isAuthenticated, router]);

  if (initialLoading || !isAuthenticated) return null;

  return (
    <>{children}</>
  );
}
