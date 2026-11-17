"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Pref = "light" | "dark" | "system";

const KEY = "theme";
const listeners = new Set<() => void>();

function readPref(): Pref {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "light";
  } catch {
    return "light";
  }
}

function applyPref(pref: Pref) {
  const root = document.documentElement;
  root.setAttribute("data-theme", pref);
}

function writePref(pref: Pref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    // Sin almacenamiento: el cambio dura solo esta visita.
  }
  applyPref(pref);
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", notify);
  };
}

const NEXT: Record<Pref, Pref> = { light: "dark", dark: "system", system: "light" };

type Props = {
  labels: { label: string; light: string; dark: string; system: string };
};

export function ThemeToggle({ labels }: Props) {
  const pref = useSyncExternalStore(subscribe, readPref, () => "light" as Pref);

  // Aplica la preferencia guardada al cargar (por defecto fondo blanco 'light').
  useEffect(() => {
    applyPref(readPref());
  }, []);

  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => writePref(NEXT[pref])}
      aria-label={`${labels.label}: ${labels[pref]}`}
      title={`${labels.label}: ${labels[pref]}`}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
