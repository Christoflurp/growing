import frogSvg from "../../assets/frog.svg";

interface FrogIconProps {
  className?: string;
  size?: number;
}

export function FrogIcon({ className = "", size = 20 }: FrogIconProps) {
  return (
    <img
      src={frogSvg}
      alt="Frog"
      className={`frog-icon ${className}`}
      width={size}
      height={size}
    />
  );
}
