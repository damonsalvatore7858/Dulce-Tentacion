type Item = { q: string; a: string };

export function Faq({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-card border border-border bg-card p-5 shadow-soft"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold">
            {item.q}
            <span aria-hidden="true" className="text-primary transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pt-2 text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
