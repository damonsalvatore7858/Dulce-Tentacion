import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export function formToRecord(formData: FormData): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}

export const flag = (formData: FormData, key: string) => formData.get(key) === "on";

// Resultado visible para quien administra: ?ok=1 o ?error=codigo
export function done(path: string): never {
  redirect(`${path}?ok=1`);
}

export function fail(path: string, code: string): never {
  redirect(`${path}?error=${encodeURIComponent(code)}`);
}

// Después de guardar, las páginas públicas se regeneran para mostrar el cambio.
export function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

export function logAdminError(scope: string, code: string | undefined) {
  console.error(`[admin] ${scope}`, code ?? "unknown");
}
