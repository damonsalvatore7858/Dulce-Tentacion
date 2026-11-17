const MESSAGES: Record<string, string> = {
  datos: "Revisa los datos: hay algún campo vacío o con un valor no permitido.",
  guardar: "No se pudo guardar. Inténtalo de nuevo.",
  duplicado: "Ya existe algo con ese nombre.",
  enuso: "No se puede borrar: todavía hay productos en esa categoría.",
  precio: "Revisa los precios: solo números (por ejemplo 18000) o déjalo vacío para 'Consultar precio'.",
  whatsapp: "El WhatsApp no es válido. Usa 10 dígitos que empiecen por 3 (por ejemplo 301 743 0183).",
  horario: "Revisa el horario: cada día necesita hora de apertura y de cierre.",
  fechas: "Revisa las fechas: la fecha final debe ser posterior a la inicial.",
  imagen: "Elige una imagen.",
  imagen_grande: "La imagen pesa más de 10 MB. Elige una imagen de hasta 10 MB.",
  imagen_tipo: "Solo se aceptan imágenes JPG, PNG o WebP.",
  imagen_subida: "No se pudo subir la imagen. Inténtalo de nuevo.",
  video_grande: "El archivo de video supera el límite de 25 MB. Elige un video más liviano o enlaza desde YouTube/Instagram.",
  video_tipo: "Solo se aceptan videos en formato MP4 o WebM.",
  video_subida: "No se pudo subir el video. Inténtalo de nuevo.",
  codigo: "El código no es correcto.",
  intentos: "Demasiados intentos. Espera unos minutos.",
};

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-field bg-destructive px-4 py-3 font-bold text-destructive-foreground">
        {MESSAGES[error] ?? "Algo salió mal."}
      </p>
    );
  }
  if (ok) {
    return (
      <p role="status" className="rounded-field bg-accent px-4 py-3 font-bold text-accent-foreground">
        Guardado. Los cambios ya se ven en el sitio.
      </p>
    );
  }
  return null;
}
