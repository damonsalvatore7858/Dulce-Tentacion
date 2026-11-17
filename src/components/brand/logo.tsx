import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

export function Logo({ className, showWordmark = true, size = 44 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}>
      <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border shadow-sm ring-2 ring-primary/20 bg-card">
        <Image
          src="/brand/logo.jpg"
          alt="Logo Dulce Tentación y algo más"
          width={size}
          height={size}
          priority
          className="size-10 sm:size-11 object-cover"
        />
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl sm:text-2xl text-primary text-neon tracking-tight">Dulce Tentación</span>
          <span className="mt-1 text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Heladería &middot; Ibagué
          </span>
        </span>
      ) : (
        <span className="sr-only">Dulce Tentación</span>
      )}
    </span>
  );
}
