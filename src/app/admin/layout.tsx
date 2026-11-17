import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={`${nunito.variable} ${pacifico.variable}`} data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
