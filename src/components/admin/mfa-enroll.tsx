"use client";

import { useState, useTransition } from "react";
import { confirmMfaEnroll, startMfaEnroll } from "@/actions/admin/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = { kind: "idle" } | { kind: "scan"; factorId: string; qr: string; secret: string } | { kind: "done" };

export function MfaEnroll() {
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(false);
    startTransition(async () => {
      const result = await startMfaEnroll();
      if (result.ok) setStep({ kind: "scan", factorId: result.factorId, qr: result.qr, secret: result.secret });
      else setError(true);
    });
  }

  function confirm() {
    if (step.kind !== "scan") return;
    setError(false);
    startTransition(async () => {
      const result = await confirmMfaEnroll(step.factorId, code);
      if (result.ok) setStep({ kind: "done" });
      else setError(true);
    });
  }

  if (step.kind === "done") {
    return (
      <p role="status" className="rounded-field bg-accent px-4 py-3 font-bold text-accent-foreground">
        Verificación en dos pasos activada. Desde ahora te pediremos el código al iniciar sesión.
      </p>
    );
  }

  if (step.kind === "scan") {
    return (
      <div className="flex max-w-md flex-col gap-4">
        <p>
          1. Abre tu app de autenticación (Google Authenticator, Authy, Microsoft Authenticator…) y escanea este
          código.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={step.qr} alt="Código QR para la app de autenticación" className="size-48 rounded-field bg-white p-2" />
        <p className="text-sm text-muted-foreground">
          ¿No puedes escanear? Escribe esta clave en la app: <span className="font-mono font-bold">{step.secret}</span>
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mfa-code">2. Escribe el código de 6 dígitos que muestra la app</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
        </div>
        {error ? (
          <p role="alert" className="font-bold text-destructive">
            El código no es correcto. Inténtalo de nuevo.
          </p>
        ) : null}
        <Button onClick={confirm} disabled={pending || code.length !== 6}>
          Activar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {error ? (
        <p role="alert" className="font-bold text-destructive">
          No se pudo iniciar. Inténtalo de nuevo.
        </p>
      ) : null}
      <Button onClick={start} disabled={pending}>
        Activar verificación en dos pasos
      </Button>
    </div>
  );
}
