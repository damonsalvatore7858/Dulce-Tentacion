"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

// Botón de envío que pide confirmación antes de borrar.
export function ConfirmSubmit({
  message,
  ...props
}: ComponentProps<typeof Button> & { message: string }) {
  return (
    <Button
      type="submit"
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    />
  );
}
