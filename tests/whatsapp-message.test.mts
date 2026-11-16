import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderMessage,
  buildEventMessage,
  whatsappLink,
} from "../src/lib/whatsapp/build-message.ts";
import { formatCOP } from "../src/lib/format/cop.ts";

test("buildOrderMessage genera mensaje correcto en español para entrega", () => {
  const msg = buildOrderMessage(
    {
      lang: "es",
      sedeName: "Belén",
      lines: [
        { name: "Copa Tentación", qty: 2, unitPrice: 12000 },
        { name: "Waffle Especial", qty: 1, unitPrice: 15000 },
      ],
      mode: "delivery",
      name: "Carlos Gómez",
      address: "Cra 5 # 10-20, Apto 301",
      total: 39000,
      hasUnpriced: false,
    },
    formatCOP,
  );

  assert.ok(msg.includes("Hola, quiero hacer un pedido en Belén:"));
  assert.ok(msg.includes("2 x Copa Tentación ($12.000 c/u = $24.000)"));
  assert.ok(msg.includes("1 x Waffle Especial ($15.000)"));
  assert.ok(msg.includes("Modo: Domicilio"));
  assert.ok(msg.includes("Nombre: Carlos Gómez"));
  assert.ok(msg.includes("Dirección: Cra 5 # 10-20, Apto 301"));
  assert.ok(msg.includes("Total referencial: $39.000"));
  assert.ok(!msg.includes("sin contar productos por consultar"));
});

test("buildOrderMessage maneja productos sin precio (por consultar)", () => {
  const msg = buildOrderMessage(
    {
      lang: "es",
      sedeName: "Ambalá",
      lines: [{ name: "Torta Personalizada", qty: 1, unitPrice: null }],
      mode: "pickup",
      name: "Ana Pérez",
      total: 0,
      hasUnpriced: true,
    },
    formatCOP,
  );

  assert.ok(msg.includes("1 x Torta Personalizada (consultar precio)"));
  assert.ok(msg.includes("(sin contar productos por consultar)"));
  assert.ok(msg.includes("Modo: Recoger"));
});

test("buildOrderMessage genera mensaje correcto en inglés", () => {
  const msg = buildOrderMessage(
    {
      lang: "en",
      sedeName: "Belén",
      lines: [{ name: "Fruit Salad", qty: 1, unitPrice: 10000 }],
      mode: "dinein",
      name: "John Doe",
      total: 10000,
      hasUnpriced: false,
    },
    formatCOP,
  );

  assert.ok(msg.includes("Hi, I'd like to place an order at Belén:"));
  assert.ok(msg.includes("Type: Dine-in"));
  assert.ok(msg.includes("Estimated total: $10.000"));
});

test("buildEventMessage genera mensaje para reserva con formato de fecha", () => {
  const msg = buildEventMessage({
    lang: "es",
    sedeName: "Belén",
    kind: "reserva",
    name: "Mariana",
    date: "2026-12-24",
    time: "16:00",
    guests: 6,
    notes: "Mesa cerca a la ventana",
  });

  assert.ok(msg.includes("Hola, quiero hacer una reserva en Belén."));
  assert.ok(msg.includes("Nombre: Mariana"));
  assert.ok(msg.includes("Fecha: 24/12/2026"));
  assert.ok(msg.includes("Hora: 16:00"));
  assert.ok(msg.includes("Personas: 6"));
  assert.ok(msg.includes("Notas: Mesa cerca a la ventana"));
});

test("whatsappLink genera URL válida con wa.me y texto codificado", () => {
  const url = whatsappLink("573001234567", "Hola mundo & café");
  assert.strictEqual(
    url,
    "https://wa.me/573001234567?text=Hola%20mundo%20%26%20caf%C3%A9",
  );
});
