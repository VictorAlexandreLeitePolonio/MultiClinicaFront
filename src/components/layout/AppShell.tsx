"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/command/CommandPalette";
import { MascotAssistant } from "@/components/mascot/MascotAssistant";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import { useAuth } from "@/contexts/AuthContext";
import { getTenantTheme } from "@/utils/tenant";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { tenant } = useAuth();
  const theme = getTenantTheme(tenant);

  return (
    <TutorialProvider>
      <div
        className="flex min-h-screen bg-background text-foreground"
        style={{
          "--tenant-primary-color": theme.primaryColor,
          "--tenant-secondary-color": theme.secondaryColor,
          "--tenant-accent-color": theme.accentColor,
        } as React.CSSProperties}
      >
        <Sidebar area="clinic" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar area="clinic" />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
          <MascotAssistant />
          <CommandPalette />
        </div>
      </div>
    </TutorialProvider>
  );
}
