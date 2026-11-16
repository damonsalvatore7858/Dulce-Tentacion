import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export const selectClass =
  "h-11 w-full rounded-field border-2 border-input bg-card px-4 text-base text-card-foreground";
export const textareaClass =
  "w-full rounded-field border-2 border-input bg-card px-4 py-3 text-base text-card-foreground";

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-[var(--primary)]" />
      {label}
    </label>
  );
}
