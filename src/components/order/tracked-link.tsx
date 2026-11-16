"use client";

import type { ComponentProps } from "react";
import { trackClick } from "@/actions/stats";
import type { ClickChannel } from "@/lib/stats/channels";

// Enlace normal que además suma un clic anónimo a la sede. Reenvía todas las props al <a>.
export function TrackedLink({
  sede,
  canal,
  onClick,
  ...rest
}: ComponentProps<"a"> & { sede: string; canal: ClickChannel }) {
  return (
    <a
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        void trackClick(sede, canal);
      }}
    />
  );
}
