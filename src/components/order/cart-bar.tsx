"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { createWhatsAppOrder } from "@/actions/pedido";
import { TrackedLink } from "@/components/order/tracked-link";
import { Turnstile, TURNSTILE_REQUIRED } from "@/components/order/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cartStore } from "@/lib/cart/store";
import { useCart } from "@/lib/cart/use-cart";
import { formatCOP } from "@/lib/format/cop";
import { LIMITS, ORDER_MODES, type ActionError, type OrderMode } from "@/lib/order/limits";

type Dict = Dictionary["order"];
type Props = { lang: Locale; dict: Dict };

type Success = { url: string; total: number; hasUnpriced: boolean; dropped: number };

export function CartBar({ lang, dict }: Props) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const count = cart.items.reduce((sum, item) => sum + item.qty, 0);

  if (count === 0 && !open) return null;

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md">
        <Button size="lg" className="w-full justify-between shadow-lift" onClick={() => setOpen(true)}>
          <span className="flex items-center gap-2">
            <ShoppingBag aria-hidden="true" />
            {dict.viewOrder}
          </span>
          <span className="rounded-pill bg-primary-foreground px-3 py-0.5 text-sm text-primary">{count}</span>
        </Button>
      </div>
      <OrderDialog lang={lang} dict={dict} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function OrderDialog({
  lang,
  dict,
  open,
  onClose,
}: {
  lang: Locale;
  dict: Dict;
  open: boolean;
  onClose: () => void;
}) {
  const cart = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<OrderMode>("pickup");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<ActionError | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [pending, startTransition] = useTransition();

  // <dialog> nativo: foco atrapado y Escape sin dependencias.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const modeLabels: Record<OrderMode, string> = {
    pickup: dict.pickup,
    dinein: dict.dinein,
    delivery: dict.delivery,
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.sedeSlug || cart.items.length === 0) return;
    setError(null);

    const payload = {
      sedeSlug: cart.sedeSlug,
      lang,
      mode,
      name,
      address: mode === "delivery" ? address : undefined,
      items: cart.items.map((item) => ({ productId: item.id, qty: item.qty })),
      turnstileToken: token ?? undefined,
    };

    startTransition(async () => {
      try {
        const result = await createWhatsAppOrder(payload);
        if (result.ok) {
          setSuccess({
            url: result.url,
            total: result.total,
            hasUnpriced: result.hasUnpriced,
            dropped: result.dropped,
          });
        } else {
          setError(result.error);
        }
      } catch {
        setError("unavailable");
      }
      setToken(null);
      setResetKey((value) => value + 1);
    });
  }

  function finish() {
    cartStore.clear();
    setSuccess(null);
    setName("");
    setAddress("");
    onClose();
  }

  const blocked = pending || (TURNSTILE_REQUIRED && !token);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="order-title"
      className="m-auto w-[min(32rem,calc(100%-1.5rem))] rounded-card border border-border bg-card p-0 text-card-foreground shadow-lift backdrop:bg-black/60"
    >
      {open ? (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 id="order-title" className="font-display text-2xl text-primary">
                {dict.yourOrder}
              </h2>
              {cart.sedeName ? (
                <p className="text-sm text-muted-foreground">
                  {dict.forSede} {cart.sedeName}
                </p>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={dict.close}>
              <X aria-hidden="true" />
            </Button>
          </div>

          <div className="overflow-y-auto p-5">
            {success ? (
              <div className="flex flex-col gap-4" role="status">
                <p className="font-bold">{dict.done}</p>
                <p>
                  {dict.total}: <span className="text-xl font-extrabold text-primary">{formatCOP(success.total)}</span>
                </p>
                {success.hasUnpriced ? <p className="text-sm text-muted-foreground">{dict.unpriced}</p> : null}
                {success.dropped > 0 ? <p className="text-sm text-muted-foreground">{dict.dropped}</p> : null}
                <p className="text-sm text-muted-foreground">{dict.disclaimer}</p>
                <Button asChild size="lg">
                  <TrackedLink
                    href={success.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sede={cart.sedeSlug ?? ""}
                    canal="whatsapp_pedido"
                  >
                    <MessageCircle aria-hidden="true" />
                    {dict.openWhatsapp}
                  </TrackedLink>
                </Button>
                <Button variant="ghost" onClick={finish}>
                  {dict.clear}
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <ul className="flex flex-col gap-2">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                      <span className="font-bold">{item.name}</span>
                      <span className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${dict.dec} ${item.name}`}
                          onClick={() => cartStore.setQty(item.id, item.qty - 1)}
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <span className="min-w-6 text-center font-extrabold">{item.qty}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${dict.inc} ${item.name}`}
                          disabled={item.qty >= LIMITS.maxQtyPerItem}
                          onClick={() => cartStore.setQty(item.id, item.qty + 1)}
                        >
                          <Plus aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${dict.remove} ${item.name}`}
                          onClick={() => cartStore.remove(item.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>

                <fieldset className="flex flex-col gap-2">
                  <legend className="pb-1 text-sm font-bold">{dict.modeLabel}</legend>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_MODES.map((value) => (
                      <label
                        key={value}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-input px-4 font-bold has-[:checked]:border-primary has-[:checked]:bg-muted"
                      >
                        <input
                          type="radio"
                          name="mode"
                          value={value}
                          checked={mode === value}
                          onChange={() => setMode(value)}
                          className="size-4 accent-[var(--primary)]"
                        />
                        {modeLabels[value]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="order-name">{dict.name}</Label>
                  <Input
                    id="order-name"
                    required
                    minLength={2}
                    maxLength={LIMITS.nameMax}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                {mode === "delivery" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="order-address">{dict.address}</Label>
                    <Input
                      id="order-address"
                      required
                      minLength={5}
                      maxLength={LIMITS.addressMax}
                      autoComplete="street-address"
                      placeholder={dict.addressHint}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                    />
                  </div>
                ) : null}

                {TURNSTILE_REQUIRED ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold">{dict.securityCheck}</span>
                    <Turnstile lang={lang} onToken={setToken} resetKey={resetKey} />
                  </div>
                ) : null}

                {error ? (
                  <p role="alert" className="rounded-field bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground">
                    {dict.errors[error]}
                  </p>
                ) : null}

                <p className="text-sm text-muted-foreground">{dict.disclaimer}</p>

                <Button type="submit" size="lg" disabled={blocked}>
                  <MessageCircle aria-hidden="true" />
                  {pending ? dict.sending : dict.send}
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
