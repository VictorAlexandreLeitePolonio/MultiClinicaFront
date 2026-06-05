"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f8fffc] text-[#0f172a] dark:bg-slate-950 dark:text-white">
      <Sidebar area="clinic" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar area="clinic" />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_34%),linear-gradient(180deg,#f8fffc_0%,#f0fdf9_100%)] dark:bg-none dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
