"use client";

interface LogoLoopItem {
  name: string;
}

interface LogoLoopProps {
  items: LogoLoopItem[];
}

export function LogoLoop({ items }: LogoLoopProps) {
  const loopItems = [...items, ...items];

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[logo-loop_28s_linear_infinite] gap-10 group-hover:[animation-play-state:paused]">
        {loopItems.map((item, index) => (
          <div
            key={`${item.name}-${index < items.length ? "first" : "second"}`}
            className="flex h-16 w-40 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-card px-6 text-center text-sm font-semibold text-gray-600 dark:bg-slate-900 dark:text-slate-300"
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
