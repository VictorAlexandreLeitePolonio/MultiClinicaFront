"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { ReactNode } from "react";

interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ tabs, value, onChange, children }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onChange} className="space-y-4">
      <RadixTabs.List className="flex flex-wrap gap-2 border-b border-[#d7f3ea] pb-2 dark:border-slate-800">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              value === tab.value
                ? "border-[#a7f3d0] bg-[#ecfdf5] text-[#0f766e] dark:border-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
                : "border-transparent text-[#64748b] hover:border-[#d7f3ea] hover:bg-white dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}
