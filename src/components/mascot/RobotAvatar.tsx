interface RobotAvatarProps {
  className?: string;
}

export function RobotAvatar({ className = "" }: RobotAvatarProps) {
  return (
    <div className={`mascot-robot ${className}`} aria-hidden="true">
      <span className="mascot-robot__antenna" />
      <span className="mascot-robot__signal" />
      <span className="mascot-robot__face">
        <span className="mascot-robot__eye" />
        <span className="mascot-robot__eye" />
        <span className="mascot-robot__mouth" />
      </span>
      <span className="mascot-robot__body">
        <span className="mascot-robot__chest" />
      </span>
      <span className="mascot-robot__arm mascot-robot__arm--left" />
      <span className="mascot-robot__arm mascot-robot__arm--right" />
    </div>
  );
}
