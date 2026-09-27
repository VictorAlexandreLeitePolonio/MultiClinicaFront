import Image from "next/image";

interface RobotAvatarProps {
  className?: string;
}

export function RobotAvatar({ className = "" }: RobotAvatarProps) {
  return (
    <picture className={`mascot-robot ${className}`} aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet="/mascot/robot-still.webp" />
      <Image
        src="/mascot/robot-wave.webp"
        alt=""
        width={320}
        height={384}
        unoptimized
        draggable={false}
      />
    </picture>
  );
}
