import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface ShimmerStyleProps {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export type ShimmerButtonProps = ShimmerStyleProps & ComponentPropsWithoutRef<"button">
export type ShimmerLinkProps = ShimmerStyleProps & ComponentPropsWithoutRef<typeof Link>

function shimmerVars({
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "100px",
  background = "rgba(0, 0, 0, 1)",
}: ShimmerStyleProps) {
  return {
    "--spread": "90deg",
    "--shimmer-color": shimmerColor,
    "--radius": borderRadius,
    "--speed": shimmerDuration,
    "--cut": shimmerSize,
    "--bg": background,
  } as CSSProperties
}

// Ajuste local: pressionar escala 0.97 (160ms ease-out), sem transition-all.
const shimmerClass =
  "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)] transform-gpu transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100"

function ShimmerLayers({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className="@container-[size] absolute inset-0 -z-30 overflow-visible blur-[2px]">
        <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none] motion-reduce:animate-none">
          <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] motion-reduce:animate-none" />
        </div>
      </div>
      {children}
      <div className="absolute inset-0 size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-200 ease-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />
      <div className="absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]" />
    </>
  )
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ shimmerColor, shimmerSize, shimmerDuration, borderRadius, background, className, children, ...props }, ref) => (
    <button
      ref={ref}
      style={shimmerVars({ shimmerColor, shimmerSize, shimmerDuration, borderRadius, background })}
      className={cn(shimmerClass, className)}
      {...props}
    >
      <ShimmerLayers>{children}</ShimmerLayers>
    </button>
  )
)
ShimmerButton.displayName = "ShimmerButton"

/** Mesmo visual do ShimmerButton, como link de navegação (sem <button> dentro de <a>). */
export function ShimmerLink({ shimmerColor, shimmerSize, shimmerDuration, borderRadius, background, className, children, ...props }: ShimmerLinkProps) {
  return (
    <Link
      style={shimmerVars({ shimmerColor, shimmerSize, shimmerDuration, borderRadius, background })}
      className={cn(shimmerClass, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]", className)}
      {...props}
    >
      <ShimmerLayers>{children}</ShimmerLayers>
    </Link>
  )
}
