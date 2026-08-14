import type { LucideIcon } from "lucide-react";

export interface ScrollStackItem {
  id: string;
  title: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface ScrollStackProps {
  items: readonly ScrollStackItem[];
}

export function ScrollStack({ items }: ScrollStackProps) {
  return (
    <div className="landing-scroll-stack relative" style={{ height: `${items.length * 72}vh` }}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.id}
            className="sticky flex min-h-[72vh] items-center justify-center py-8"
            style={{ top: "14vh" }}
          >
            <div className="landing-scroll-card">
              <div className="landing-scroll-card__icon">
                <Icon size={22} />
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{item.label}</p>
              <h3 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">{item.title}</h3>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">{item.description}</p>
              <div className="landing-scroll-card__line" />
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                Visão conectada
                <span aria-hidden="true">↗</span>
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
