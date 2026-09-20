import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Envoltorio fino sobre un ícono de lucide-react con tamaño/grosor de
 * trazo por defecto, para que todos los íconos del proyecto se vean
 * consistentes sin repetir size/strokeWidth en cada uso.
 */
export default function Icon({
  icon: LucideIconComponent,
  size = 18,
  strokeWidth = 1.75,
  className,
}: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
