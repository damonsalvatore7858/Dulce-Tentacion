import { safeJsonForScript } from "@/lib/seo/json-ld";

// Único uso de dangerouslySetInnerHTML del proyecto: JSON-LD ya serializado y escapado
// por safeJsonForScript (los datos editables no pueden salir de la etiqueta <script>).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonForScript(data) }} />;
}
