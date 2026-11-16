// Construcción de mensajes de WhatsApp. Sin dependencias para poder probarlo aislado.
// Los precios y nombres que llegan aquí YA vienen de la base de datos (nunca del navegador).

export type Lang = "es" | "en";
export type Mode = "pickup" | "dinein" | "delivery";
export type EventKind = "reserva" | "evento" | "encargo";

export type OrderLine = {
  name: string;
  qty: number;
  unitPrice: number | null;
};

type OrderMessageInput = {
  lang: Lang;
  sedeName: string;
  lines: OrderLine[];
  mode: Mode;
  name: string;
  address?: string;
  total: number;
  hasUnpriced: boolean;
};

const TEXT = {
  es: {
    intro: (sede: string) => `Hola, quiero hacer un pedido en ${sede}:`,
    each: "c/u",
    consult: "consultar precio",
    mode: "Modo",
    modes: { pickup: "Recoger", dinein: "Consumir aquí", delivery: "Domicilio" },
    name: "Nombre",
    address: "Dirección",
    total: "Total referencial",
    unpriced: "(sin contar productos por consultar)",
    disclaimer: "El total es referencial. La sede confirma disponibilidad, costo de domicilio y forma de pago.",
  },
  en: {
    intro: (sede: string) => `Hi, I'd like to place an order at ${sede}:`,
    each: "each",
    consult: "ask for price",
    mode: "Type",
    modes: { pickup: "Pickup", dinein: "Dine-in", delivery: "Delivery" },
    name: "Name",
    address: "Address",
    total: "Estimated total",
    unpriced: "(not counting items priced on request)",
    disclaimer: "The total is an estimate. The location confirms availability, delivery cost and payment method.",
  },
} as const;

export function buildOrderMessage(input: OrderMessageInput, fmt: (n: number) => string): string {
  const t = TEXT[input.lang];
  const lines = input.lines.map((line) => {
    if (line.unitPrice === null) return `- ${line.qty} x ${line.name} (${t.consult})`;
    const subtotal = line.unitPrice * line.qty;
    return line.qty === 1
      ? `- 1 x ${line.name} (${fmt(line.unitPrice)})`
      : `- ${line.qty} x ${line.name} (${fmt(line.unitPrice)} ${t.each} = ${fmt(subtotal)})`;
  });

  const parts = [
    t.intro(input.sedeName),
    "",
    ...lines,
    "",
    `${t.mode}: ${t.modes[input.mode]}`,
    `${t.name}: ${input.name}`,
  ];
  if (input.mode === "delivery" && input.address) parts.push(`${t.address}: ${input.address}`);
  parts.push(
    "",
    `${t.total}: ${fmt(input.total)}${input.hasUnpriced ? ` ${t.unpriced}` : ""}`,
    t.disclaimer,
  );
  return parts.join("\n");
}

type EventMessageInput = {
  lang: Lang;
  sedeName: string;
  kind: EventKind;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  notes?: string;
};

const EVENT_TEXT = {
  es: {
    intro: {
      reserva: (s: string) => `Hola, quiero hacer una reserva en ${s}.`,
      evento: (s: string) => `Hola, quiero consultar un evento o cumpleaños en ${s}.`,
      encargo: (s: string) => `Hola, quiero hacer un pedido por encargo en ${s}.`,
    },
    name: "Nombre",
    date: "Fecha",
    time: "Hora",
    guests: "Personas",
    notes: "Notas",
    disclaimer: "La sede confirma disponibilidad.",
  },
  en: {
    intro: {
      reserva: (s: string) => `Hi, I'd like to make a booking at ${s}.`,
      evento: (s: string) => `Hi, I'd like to ask about an event or birthday at ${s}.`,
      encargo: (s: string) => `Hi, I'd like to place a custom order at ${s}.`,
    },
    name: "Name",
    date: "Date",
    time: "Time",
    guests: "Guests",
    notes: "Notes",
    disclaimer: "The location confirms availability.",
  },
} as const;

export function buildEventMessage(input: EventMessageInput): string {
  const t = EVENT_TEXT[input.lang];
  const [year, month, day] = input.date.split("-");
  const parts = [
    t.intro[input.kind](input.sedeName),
    "",
    `${t.name}: ${input.name}`,
    `${t.date}: ${day}/${month}/${year}`,
    `${t.time}: ${input.time}`,
    `${t.guests}: ${input.guests}`,
  ];
  if (input.notes) parts.push(`${t.notes}: ${input.notes}`);
  parts.push("", t.disclaimer);
  return parts.join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
