"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f1] dark:bg-slate-950">
      <Sidebar area="clinic" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar area="clinic" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
