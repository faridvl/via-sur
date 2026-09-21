import Image from "next/image";

interface LogoTicoRedProps {
  className?: string;
  size?: number;
}

export default function LogoTicoRed({ className, size = 28 }: LogoTicoRedProps) {
  return (
    <Image
      src="/logo-ticored.png"
      alt="TicoRed"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
