// Límites compartidos por el navegador (comodidad) y el servidor (obligatorio).
export const LIMITS = {
  maxQtyPerItem: 10,
  maxDistinctItems: 20,
  maxTotalQty: 40,
  nameMax: 60,
  addressMax: 120,
  notesMax: 300,
  guestsMax: 200,
} as const;

export const ORDER_MODES = ["pickup", "dinein", "delivery"] as const;
export type OrderMode = (typeof ORDER_MODES)[number];

export const EVENT_KINDS = ["reserva", "evento", "encargo"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export type ActionError =
  | "invalid"
  | "rate_limited"
  | "captcha"
  | "no_whatsapp"
  | "empty"
  | "unavailable";

export type OrderResult =
  | { ok: true; url: string; total: number; hasUnpriced: boolean; dropped: number }
  | { ok: false; error: ActionError };

export type LinkResult = { ok: true; url: string } | { ok: false; error: ActionError };
