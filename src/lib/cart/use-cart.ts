"use client";

import { useSyncExternalStore } from "react";
import { cartStore, type CartState } from "@/lib/cart/store";

export function useCart(): CartState {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
}
