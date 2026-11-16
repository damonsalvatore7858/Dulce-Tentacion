import { LIMITS } from "@/lib/order/limits";

// Estado del pedido en el navegador. Guarda SOLO ids, nombres (para mostrar) y cantidades.
// Los precios nunca se guardan aquí: el servidor los lee de la base de datos.

export type CartItem = { id: string; name: string; qty: number };
export type CartState = { sedeSlug: string | null; sedeName: string | null; items: CartItem[] };
export type AddResult = "ok" | "replaced" | "limit";

const KEY = "dt_cart_v1";
const EMPTY: CartState = { sedeSlug: null, sedeName: null, items: [] };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let state: CartState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

// Valida lo que viene de localStorage: puede haber sido manipulado.
function parse(raw: string | null): CartState {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY;
    const record = data as Record<string, unknown>;
    if (typeof record.sedeSlug !== "string" || !SLUG.test(record.sedeSlug)) return EMPTY;
    if (!Array.isArray(record.items)) return EMPTY;

    const items: CartItem[] = [];
    for (const entry of record.items.slice(0, LIMITS.maxDistinctItems)) {
      if (typeof entry !== "object" || entry === null) continue;
      const item = entry as Record<string, unknown>;
      if (typeof item.id !== "string" || !UUID.test(item.id)) continue;
      if (typeof item.name !== "string") continue;
      if (typeof item.qty !== "number" || !Number.isInteger(item.qty)) continue;
      if (item.qty < 1 || item.qty > LIMITS.maxQtyPerItem) continue;
      items.push({ id: item.id, name: item.name.slice(0, 120), qty: item.qty });
    }
    if (items.length === 0) return EMPTY;

    return {
      sedeSlug: record.sedeSlug,
      sedeName: typeof record.sedeName === "string" ? record.sedeName.slice(0, 120) : record.sedeSlug,
      items,
    };
  } catch {
    return EMPTY;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parse(localStorage.getItem(KEY));
  } catch {
    state = EMPTY;
  }
}

function commit(next: CartState) {
  state = next;
  try {
    if (next.items.length === 0) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento: el pedido dura solo esta visita.
  }
  listeners.forEach((notify) => notify());
}

function totalQty(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export const cartStore = {
  subscribe(notify: () => void) {
    listeners.add(notify);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEY) return;
      state = parse(event.newValue);
      notify();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(notify);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): CartState {
    load();
    return state;
  },
  getServerSnapshot(): CartState {
    return EMPTY;
  },

  add(sedeSlug: string, sedeName: string, item: { id: string; name: string }): AddResult {
    load();
    const replaced = state.sedeSlug !== null && state.sedeSlug !== sedeSlug && state.items.length > 0;
    const base: CartState = replaced || state.sedeSlug === null ? { sedeSlug, sedeName, items: [] } : state;

    const existing = base.items.find((line) => line.id === item.id);
    if (existing) {
      if (existing.qty >= LIMITS.maxQtyPerItem || totalQty(base.items) >= LIMITS.maxTotalQty) return "limit";
      commit({
        ...base,
        items: base.items.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line)),
      });
    } else {
      if (base.items.length >= LIMITS.maxDistinctItems || totalQty(base.items) >= LIMITS.maxTotalQty) return "limit";
      commit({ ...base, items: [...base.items, { id: item.id, name: item.name, qty: 1 }] });
    }
    return replaced ? "replaced" : "ok";
  },

  setQty(id: string, qty: number) {
    load();
    if (qty <= 0) {
      cartStore.remove(id);
      return;
    }
    const capped = Math.min(qty, LIMITS.maxQtyPerItem);
    const others = totalQty(state.items.filter((line) => line.id !== id));
    if (others + capped > LIMITS.maxTotalQty) return;
    commit({
      ...state,
      items: state.items.map((line) => (line.id === id ? { ...line, qty: capped } : line)),
    });
  },

  remove(id: string) {
    load();
    const items = state.items.filter((line) => line.id !== id);
    commit(items.length === 0 ? EMPTY : { ...state, items });
  },

  clear() {
    load();
    commit(EMPTY);
  },
};
