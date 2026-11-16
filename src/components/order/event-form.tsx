"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { createEventLink } from "@/actions/encargos";
import { Turnstile, TURNSTILE_REQUIRED } from "@/components/order/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { EVENT_KINDS, LIMITS, type ActionError, type EventKind } from "@/lib/order/limits";

type Props = {
  lang: Locale;
  dict: Dictionary["eventForm"];
  errors: Dictionary["order"]["errors"];
  sedes: { slug: string; nombre: string }[];
  kinds: EventKind[];
};

const SELECT_CLASS =
  "h-11 w-full rounded-field border-2 border-input bg-card px-4 text-base text-card-foreground";

function getMinEventDate(): string {
  // Fecha mínima en hora de Colombia (UTC-5).
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function EventForm({ lang, dict, errors, sedes, kinds }: Props) {
  const [sedeSlug, setSedeSlug] = useState(sedes[0]?.slug ?? "");
  const [kind, setKind] = useState<EventKind>(kinds[0] ?? "reserva");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<ActionError | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const kindLabels: Record<EventKind, string> = {
    reserva: dict.reserva,
    evento: dict.evento,
    encargo: dict.encargo,
  };

  // Fecha mínima en hora de Colombia (UTC-5).
  const minDate = getMinEventDate();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUrl(null);

    const payload = {
      sedeSlug,
      lang,
      kind,
      name,
      date,
      time,
      guests: Number(guests),
      notes: notes || undefined,
      turnstileToken: token ?? undefined,
    };

    startTransition(async () => {
      try {
        const result = await createEventLink(payload);
        if (result.ok) setUrl(result.url);
        else setError(result.error);
      } catch {
        setError("unavailable");
      }
      setToken(null);
      setResetKey((value) => value + 1);
    });
  }

  return (
    <form onSubmit={submit} className="flex max-w-xl flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ev-sede">{dict.sede}</Label>
        <select id="ev-sede" className={SELECT_CLASS} value={sedeSlug} onChange={(e) => setSedeSlug(e.target.value)}>
          {sedes.map((sede) => (
            <option key={sede.slug} value={sede.slug}>
              {sede.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ev-kind">{dict.kind}</Label>
        <select id="ev-kind" className={SELECT_CLASS} value={kind} onChange={(e) => setKind(e.target.value as EventKind)}>
          {EVENT_KINDS.filter((value) => kinds.includes(value)).map((value) => (
            <option key={value} value={value}>
              {kindLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ev-name">{dict.name}</Label>
        <Input id="ev-name" required minLength={2} maxLength={LIMITS.nameMax} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-date">{dict.date}</Label>
          <Input id="ev-date" type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-time">{dict.time}</Label>
          <Input id="ev-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-guests">{dict.guests}</Label>
          <Input id="ev-guests" type="number" required min={1} max={LIMITS.guestsMax} inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ev-notes">{dict.notes}</Label>
        <textarea
          id="ev-notes"
          rows={3}
          maxLength={LIMITS.notesMax}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-field border-2 border-input bg-card px-4 py-3 text-base text-card-foreground"
        />
      </div>

      {TURNSTILE_REQUIRED ? <Turnstile lang={lang} onToken={setToken} resetKey={resetKey} /> : null}

      {error ? (
        <p role="alert" className="rounded-field bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground">
          {errors[error]}
        </p>
      ) : null}

      {url ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="font-bold">{dict.done}</p>
          <Button asChild size="lg">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              {dict.openWhatsapp}
            </a>
          </Button>
        </div>
      ) : (
        <Button type="submit" size="lg" disabled={pending || (TURNSTILE_REQUIRED && !token)}>
          <MessageCircle aria-hidden="true" />
          {pending ? dict.sending : dict.send}
        </Button>
      )}
    </form>
  );
}
