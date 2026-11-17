"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme: "auto";
      language: string;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Las claves de prueba oficiales de Cloudflare (1x000000..., 2x000000..., 3x000000...)
// provocan que el iframe de Cloudflare muestre un aviso rojo intrusivo:
// "Solo para pruebas. Si se ve, informe al propietario del sitio".
// Por ello, solo activamos el widget visual si se configura una clave real de producción (ej: 0x4AAAAAA...).
const rawSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const isTestKey =
  !rawSiteKey ||
  rawSiteKey.startsWith("1x000000") ||
  rawSiteKey.startsWith("2x000000") ||
  rawSiteKey.startsWith("3x000000");

const SITE_KEY = isTestKey ? undefined : rawSiteKey;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Props = {
  lang: string;
  onToken: (token: string | null) => void;
  resetKey: number;
};

// Widget anti-bot de Cloudflare. Sin clave pública no se dibuja (el servidor decide si exige token).
export function Turnstile({ lang, onToken, resetKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      const container = containerRef.current;
      if (cancelled || !container || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(container, {
        sitekey: SITE_KEY,
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
        theme: "auto",
        language: lang,
      });
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }

    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
      }
      widgetRef.current = null;
    };
  }, [lang]);

  // Los tokens son de un solo uso: se reinicia el widget tras cada envío.
  useEffect(() => {
    if (resetKey === 0) return;
    if (widgetRef.current && window.turnstile) {
      onTokenRef.current(null);
      window.turnstile.reset(widgetRef.current);
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-16" />;
}

export const TURNSTILE_REQUIRED = Boolean(SITE_KEY);
