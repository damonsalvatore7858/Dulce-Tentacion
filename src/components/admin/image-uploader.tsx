"use client";

import { AlertCircle, CheckCircle2, Image as ImageIcon, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState, type DragEvent } from "react";
import Image from "next/image";

type Props = {
  initialImageUrl?: string | null;
  inputName?: string;
  removeInputName?: string;
};

type FileMeta = {
  name: string;
  sizeFormatted: string;
  dimensions?: string;
  format: string;
  isHighRes?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Optimiza imágenes excesivamente pesadas (> 10 MB) para que no fallen al subirse,
// conservando una resolución máxima de 2400px en alta fidelidad.
async function smartOptimizeIfNeeded(file: File): Promise<File> {
  if (file.size <= 10 * 1024 * 1024) {
    return file; // Si pesa 10 MB o menos, se conserva el archivo 100% original
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 2400;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const outputMime = file.type === "image/png" ? "image/png" : "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
            type: outputMime,
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        outputMime,
        0.94,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export function ImageUploader({
  initialImageUrl,
  inputName = "file",
  removeInputName = "remove_image",
}: Props) {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [markRemove, setMarkRemove] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // La URL activa se deriva de forma pura sin necesidad de efectos secundarios
  const previewUrl = selectedFileUrl ?? (!markRemove ? (initialImageUrl ?? null) : null);

  const processFile = useCallback(async (rawFile: File) => {
    setErrorMsg(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(rawFile.type)) {
      setErrorMsg("Formato no válido. Solo se admiten fotos en formato JPG, PNG o WebP.");
      return;
    }

    setIsProcessing(true);
    try {
      const file = await smartOptimizeIfNeeded(rawFile);

      // Sincronizar con el input nativo vía DataTransfer para que el submit del formulario lo envíe
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }

      const objUrl = URL.createObjectURL(file);
      setSelectedFileUrl(objUrl);
      setMarkRemove(false);

      const ext = file.name.split(".").pop()?.toUpperCase() ?? "IMG";
      const initialMeta: FileMeta = {
        name: file.name,
        sizeFormatted: formatBytes(file.size),
        format: ext,
      };

      const img = new window.Image();
      img.onload = () => {
        setFileMeta({
          ...initialMeta,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
          isHighRes: img.naturalWidth >= 1200 || img.naturalHeight >= 1200,
        });
      };
      img.src = objUrl;
    } catch {
      setErrorMsg("No se pudo procesar la imagen seleccionada.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const clearSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFileUrl(null);
    setFileMeta(null);
    setErrorMsg(null);
  };

  const handleMarkRemoveToggle = () => {
    setMarkRemove((prev) => {
      const next = !prev;
      if (next) {
        clearSelection();
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input nativo oculto pero accesible para envío de formulario */}
      <input
        ref={fileInputRef}
        type="file"
        id={inputName}
        name={inputName}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Seleccionar fotografía de alta calidad"
      />

      {/* Flag para eliminar la imagen existente al guardar */}
      {markRemove ? <input type="hidden" name={removeInputName} value="1" /> : null}

      {/* Zona de Drop o Previsualización */}
      {previewUrl && !markRemove ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-muted/40 p-4 transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Contenedor de imagen 4:3 con calidad nítida */}
            <div className="relative aspect-[4/3] w-full max-w-[260px] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
              <Image
                src={previewUrl}
                alt="Vista previa de la fotografía"
                fill
                unoptimized={previewUrl.startsWith("blob:")}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 260px"
              />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[0.7rem] font-bold tracking-wide text-white backdrop-blur-xs">
                {fileMeta ? "Nueva foto" : "Foto actual"}
              </span>
            </div>

            {/* Metadatos y acciones */}
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    {fileMeta ? "Imagen lista en alta resolución" : "Fotografía cargada"}
                  </span>
                </div>

                {fileMeta ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {fileMeta.format}
                    </span>
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                      {fileMeta.sizeFormatted}
                    </span>
                    {fileMeta.dimensions ? (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {fileMeta.dimensions}
                      </span>
                    ) : null}
                    {fileMeta.isHighRes ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        HD Nítida
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Esta es la foto que se muestra actualmente en la carta digital y en la portada del producto.
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RefreshCw className="size-3.5 text-muted-foreground" />
                  {fileMeta ? "Cambiar por otra foto" : "Reemplazar foto"}
                </button>

                {fileMeta ? (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Descartar nueva selección
                  </button>
                ) : null}

                {initialImageUrl && !fileMeta ? (
                  <button
                    type="button"
                    onClick={handleMarkRemoveToggle}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    Quitar foto
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Zona interactiva vacía para arrastrar o hacer clic */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
              : "border-border/80 bg-card/60 hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            {isProcessing ? (
              <RefreshCw className="size-7 animate-spin" />
            ) : (
              <UploadCloud className="size-7" />
            )}
          </div>

          <div className="flex flex-col gap-1 max-w-md">
            <p className="text-sm font-bold text-foreground">
              {isDragging
                ? "Suelta la imagen aquí"
                : "Haz clic para seleccionar o arrastra la foto aquí"}
            </p>
            <p className="text-xs text-muted-foreground">
              Admite fotos de alta calidad (JPG, PNG o WebP hasta 10 MB).
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[0.72rem] font-semibold text-muted-foreground">
            <ImageIcon className="size-3.5 text-primary" />
            Resolución recomendada: 4:3 o 1:1, mín. 800×600 px
          </div>
        </div>
      )}

      {/* Aviso si se marcó para eliminar */}
      {markRemove ? (
        <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          <span>La foto actual se eliminará al guardar este producto.</span>
          <button
            type="button"
            onClick={handleMarkRemoveToggle}
            className="font-bold underline hover:no-underline"
          >
            Cancelar eliminación
          </button>
        </div>
      ) : null}

      {/* Alerta de error si ocurrió algún problema */}
      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/15 p-3 text-xs font-semibold text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : null}
    </div>
  );
}
