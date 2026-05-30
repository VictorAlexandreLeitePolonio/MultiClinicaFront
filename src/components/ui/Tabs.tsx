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
      <RadixTabs.List className="flex flex-wrap gap-2 border-b-2 border-[#e2ebe6] pb-2 dark:border-slate-800">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            type="button"
            className={`rounded-sm border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              value === tab.value
                ? "border-[#5a9c94] bg-[#e8f4f3] text-[#1a4a3a] dark:bg-slate-800 dark:text-[#7bbfb8]"
                : "border-transparent text-[#4a6354] hover:border-[#d8d2c8] dark:text-slate-300"
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
