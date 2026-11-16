"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartStore } from "@/lib/cart/store";
import { useCart } from "@/lib/cart/use-cart";
import { LIMITS } from "@/lib/order/limits";

type Props = {
  sedeSlug: string;
  sedeName: string;
  productId: string;
  name: string;
  labels: { add: string; inc: string; dec: string; replaced: string; limit: string };
};

export function AddToCart({ sedeSlug, sedeName, productId, name, labels }: Props) {
  const cart = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const line = cart.sedeSlug === sedeSlug ? cart.items.find((item) => item.id === productId) : undefined;

  function add() {
    const result = cartStore.add(sedeSlug, sedeName, { id: productId, name });
    setMessage(result === "replaced" ? labels.replaced : result === "limit" ? labels.limit : null);
  }

  return (
    <div className="flex flex-col gap-2">
      {line ? (
        <div className="flex items-center justify-between gap-2 rounded-pill bg-muted p-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`${labels.dec} ${name}`}
            onClick={() => {
              cartStore.setQty(productId, line.qty - 1);
              setMessage(null);
            }}
          >
            <Minus aria-hidden="true" />
          </Button>
          <span aria-live="polite" className="min-w-8 text-center text-lg font-extrabold">
            {line.qty}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`${labels.inc} ${name}`}
            disabled={line.qty >= LIMITS.maxQtyPerItem}
            onClick={add}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <Button onClick={add} className="w-full">
          <Plus aria-hidden="true" />
          {labels.add}
        </Button>
      )}
      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
