import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

// LOGO PROVISIONAL: se reemplaza por el archivo original cuando el dueño lo entregue.
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-11 shrink-0">
        <circle cx="24" cy="24" r="22" strokeWidth="3" className="fill-white stroke-brand-choco" />
        <circle cx="24" cy="14" r="6" className="fill-brand-choco" />
        <circle cx="17" cy="20" r="6" className="fill-brand-pink" />
        <circle cx="31" cy="20" r="6" className="fill-brand-blue" />
        <path d="M14 26h20l-10 15z" className="fill-brand-pastel stroke-brand-choco" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl text-primary text-neon">Dulce Tentación</span>
          <span className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Heladería
          </span>
        </span>
      ) : (
        <span className="sr-only">Dulce Tentación</span>
      )}
    </span>
  );
}
