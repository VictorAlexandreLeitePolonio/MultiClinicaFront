import Image from "next/image";

type BrandVariant = "mark" | "lockup" | "lockup-dark" | "icon" | "icon-dark";

interface BrandLogoProps {
  /**
   * "mark" = ícone de app (Q-bot no tile escuro), "icon" = símbolo sobre fundo claro,
   * "icon-dark" = símbolo sobre fundo escuro, "lockup" = símbolo + "Cliniq Care" no claro,
   * "lockup-dark" = idem no escuro.
   */
  variant?: BrandVariant;
  /** Altura em px (a largura acompanha o aspecto). */
  size?: number;
  className?: string;
  priority?: boolean;
}

const ASSETS: Record<BrandVariant, { src: string; ratio: number }> = {
  mark: { src: "/logos/cliniq-app-icon.svg", ratio: 1 },
  icon: { src: "/logos/cliniq-symbol.svg", ratio: 1 },
  "icon-dark": { src: "/logos/cliniq-symbol-on-dark.svg", ratio: 1 },
  lockup: { src: "/logos/cliniq-lockup-horizontal.svg", ratio: 991 / 256 },
  "lockup-dark": { src: "/logos/cliniq-lockup-horizontal-on-dark.svg", ratio: 991 / 256 },
};

/** Marca Cliniq Care (Q-bot). SVG direto: nada a otimizar e nítido em qualquer tamanho. */
export function BrandLogo({ variant = "mark", size = 40, className, priority }: BrandLogoProps) {
  const { src, ratio } = ASSETS[variant];
  return (
    <Image
      src={src}
      alt="Cliniq Care"
      width={Math.round(size * ratio)}
      height={size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
