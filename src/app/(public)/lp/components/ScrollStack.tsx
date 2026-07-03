"use client";

import { Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
}

interface ScrollStackProps {
  items: TestimonialItem[];
}

export function ScrollStack({ items }: ScrollStackProps) {
  return (
    <div className="relative" style={{ height: `${items.length * 100}vh` }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="sticky flex min-h-screen items-center justify-center px-6"
          style={{ top: 0, zIndex: index + 1 }}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-gray-200 bg-card p-8 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)] dark:bg-slate-900"
            style={{ transform: `translateY(${index * 8}px) scale(${1 - index * 0.015})` }}
          >
            <Quote className="text-primary" size={32} aria-hidden="true" />
            <p className="mt-4 text-lg leading-8 text-secondary dark:text-slate-100">
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-sm font-bold text-primary-dark">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-secondary dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">{item.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
