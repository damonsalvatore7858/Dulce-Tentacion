import type { Dictionary } from "@/i18n/dictionaries";
import type { Sede } from "@/lib/data/types";

const ORDER = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;

// Muestra horarios semanales solo si el admin ya los cargó.
export function SedeHours({ sede, dict }: { sede: Sede; dict: Dictionary }) {
  if (Object.keys(sede.horarios ?? {}).length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-2xl">{dict.common.hours}</h2>
      <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        {ORDER.map((day) => {
          const slots = sede.horarios[day] ?? [];
          return (
            <div key={day} className="contents">
              <dt className="font-bold">{dict.common.days[day]}</dt>
              <dd className="text-muted-foreground">
                {slots.length === 0
                  ? dict.common.closed
                  : slots.map((slot) => `${slot.abre} - ${slot.cierra}`).join(", ")}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
