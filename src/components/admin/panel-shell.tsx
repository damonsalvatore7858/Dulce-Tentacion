import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";

export function PanelShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="page-container flex flex-col gap-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-4xl text-primary">{title}</h1>
          {intro ? <p className="max-w-2xl text-muted-foreground">{intro}</p> : null}
        </header>
        {children}
      </main>
    </>
  );
}

export type FlashParams = { searchParams: Promise<{ ok?: string; error?: string }> };
