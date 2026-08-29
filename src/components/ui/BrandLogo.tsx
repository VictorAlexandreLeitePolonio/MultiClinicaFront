import Image from "next/image";

type BrandVariant = "mark" | "lockup" | "icon";

interface BrandLogoProps {
  /** "mark" = app-icon (tile), "lockup" = ícone + wordmark, "icon" = símbolo sobre fundo claro. */
  variant?: BrandVariant;
  /** Altura em px (a largura acompanha o aspecto). */
  size?: number;
  className?: string;
  priority?: boolean;
}

const ASSETS: Record<BrandVariant, { src: string; ratio: number }> = {
  mark: { src: "/logos/app_logo.png", ratio: 1 },
  icon: { src: "/logos/small_logo.png", ratio: 1 },
  lockup: { src: "/logos/big_logo.png", ratio: 1448 / 1086 },
};

/** Logo da marca Cliniq a partir dos assets em /public/logos. */
export function BrandLogo({ variant = "mark", size = 40, className, priority }: BrandLogoProps) {
  const { src, ratio } = ASSETS[variant];
  return (
    <Image
      src={src}
      alt="Cliniq"
      width={Math.round(size * ratio)}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
