import test from "node:test";
import assert from "node:assert/strict";
import {
  clean,
  nameSchema,
  addressSchema,
  orderSchema,
  eventSchema,
} from "../src/lib/validation/order.ts";

test("clean elimina caracteres de control y normaliza espacios", () => {
  const dirty = "  Juan\u0000\u001F Pérez   Gómez  ";
  assert.strictEqual(clean(dirty), "Juan Pérez Gómez");
});

test("nameSchema valida nombres reales y rechaza caracteres extraños", () => {
  assert.ok(nameSchema.safeParse("María José").success);
  assert.ok(nameSchema.safeParse("Jean-Pierre D'Angelo").success);
  assert.ok(!nameSchema.safeParse("A").success); // Demasiado corto (<2)
  assert.ok(!nameSchema.safeParse("Juan <script>").success); // Caracteres no permitidos
});

test("addressSchema valida direcciones colombianas", () => {
  assert.ok(addressSchema.safeParse("Carrera 5 # 10-20 Barrio Centro").success);
  assert.ok(addressSchema.safeParse("Mz A Casa 12 Etapa 2").success);
  assert.ok(!addressSchema.safeParse("Cra").success); // Demasiado corta (<5)
});

test("orderSchema valida un pedido válido", () => {
  const valid = {
    sedeSlug: "belen",
    lang: "es",
    mode: "pickup",
    name: "Laura Martínez",
    items: [
      { productId: "11111111-1111-4111-8111-111111111111", qty: 2 },
    ],
  };
  const res = orderSchema.safeParse(valid);
  assert.ok(res.success);
});

test("orderSchema exige dirección obligatoria en modo delivery", () => {
  const invalid = {
    sedeSlug: "belen",
    lang: "es",
    mode: "delivery",
    name: "Laura Martínez",
    items: [
      { productId: "11111111-1111-4111-8111-111111111111", qty: 2 },
    ],
  };
  const res = orderSchema.safeParse(invalid);
  assert.ok(!res.success);
});

test("orderSchema rechaza cantidad total superior a LIMITS.maxTotalQty", () => {
  const invalid = {
    sedeSlug: "belen",
    lang: "es",
    mode: "pickup",
    name: "Laura Martínez",
    items: [
      { productId: "11111111-1111-4111-8111-111111111111", qty: 10 },
      { productId: "22222222-2222-4222-8222-222222222222", qty: 10 },
      { productId: "33333333-3333-4333-8333-333333333333", qty: 10 },
      { productId: "44444444-4444-4444-8444-444444444444", qty: 10 },
      { productId: "55555555-5555-4555-8555-555555555555", qty: 10 }, // Total = 50 > maxTotalQty (40)
    ],
  };
  const res = orderSchema.safeParse(invalid);
  assert.ok(!res.success);
});

test("eventSchema valida reserva futura y rechaza fecha pasada", () => {
  // Fecha futura dentro de los próximos 30 días
  const future = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
  const valid = {
    sedeSlug: "ambala",
    lang: "es",
    kind: "reserva",
    name: "Andrés Castro",
    date: future,
    time: "15:30",
    guests: 4,
  };
  assert.ok(eventSchema.safeParse(valid).success);

  const past = {
    ...valid,
    date: "2020-01-01",
  };
  assert.ok(!eventSchema.safeParse(past).success);
});
