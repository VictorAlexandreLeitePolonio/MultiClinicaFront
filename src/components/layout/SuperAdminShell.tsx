"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface SuperAdminShellProps {
  children: ReactNode;
}

export function SuperAdminShell({ children }: SuperAdminShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f1] dark:bg-slate-950">
      <Sidebar area="superadmin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar area="superadmin" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
