"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Pref = "system" | "light" | "dark";

const KEY = "theme";
const listeners = new Set<() => void>();

function readPref(): Pref {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyPref(pref: Pref) {
  const root = document.documentElement;
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

function writePref(pref: Pref) {
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
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

const NEXT: Record<Pref, Pref> = { system: "light", light: "dark", dark: "system" };

type Props = {
  labels: { label: string; light: string; dark: string; system: string };
};

export function ThemeToggle({ labels }: Props) {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as Pref);

  // Aplica la preferencia guardada al cargar.
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
