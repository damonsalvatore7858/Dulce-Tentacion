import { formatCOP } from "@/lib/format/cop";
import { cn } from "@/lib/utils";

type Props = {
  value: number | null;
  consultLabel: string;
  muted?: boolean;
  className?: string;
};

// precio null => "Consultar precio" (dato pendiente configurable desde el admin).
export function Price({ value, consultLabel, muted = false, className }: Props) {
  if (value === null) {
    return <span className={cn("text-sm font-bold text-muted-foreground", className)}>{consultLabel}</span>;
  }
  return (
    <span
      className={cn(
        "text-xl font-extrabold text-primary",
        muted && "text-muted-foreground line-through",
        className,
      )}
    >
      {formatCOP(value)}
    </span>
  );
}
