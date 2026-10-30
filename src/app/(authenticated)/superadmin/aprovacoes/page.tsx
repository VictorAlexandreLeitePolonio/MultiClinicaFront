"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { HubApprovals } from "./components/HubApprovals";

export default function HubApprovalsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Aprovações do hub" />
      <HubApprovals />
    </div>
  );
}
