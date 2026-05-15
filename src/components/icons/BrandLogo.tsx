import Image from "next/image";
import { assets } from "@/lib/assets";

type BrandLogoProps = {
  variant?: "full" | "mark";
  className?: string;
};

export function BrandLogo({ variant = "full", className = "" }: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src={assets.brand.mark}
        alt="PrismPDF"
        width={32}
        height={32}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src={assets.brand.logo}
      alt="PrismPDF"
      width={160}
      height={40}
      className={`h-8 w-auto ${className}`}
      priority
    />
  );
}
