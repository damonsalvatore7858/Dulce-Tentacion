import { Heart } from "lucide-react";

type Props = { message: string; tone?: "empty" | "error" };

export function EmptyState({ message, tone = "empty" }: Props) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-border bg-card px-6 py-12 text-center"
    >
      <Heart aria-hidden="true" className="size-10 text-primary/60" />
      <p className="max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}
