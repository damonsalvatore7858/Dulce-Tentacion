import * as React from "react";
import { cn } from "@/lib/utils";

// Estado de carga. aria-hidden: lo anuncia el contenedor con aria-busy.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-field bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
