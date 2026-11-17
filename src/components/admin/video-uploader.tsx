"use client";

import { AlertCircle, Film, Link2, Trash2, UploadCloud, Video } from "lucide-react";
import { useState, useRef, type ChangeEvent } from "react";
import { parseVideoUrl, publicVideoUrl } from "@/lib/media/video";

type Props = {
  initialVideoUrl?: string | null;
  inputName?: string;
  fileInputName?: string;
  removeInputName?: string;
};

export function VideoUploader({
  initialVideoUrl,
  inputName = "video_url",
  fileInputName = "video_file",
  removeInputName = "remove_video",
}: Props) {
  const [tab, setTab] = useState<"link" | "file">("link");
  const [urlValue, setUrlValue] = useState<string>(
    initialVideoUrl && initialVideoUrl.startsWith("http") ? initialVideoUrl : "",
  );
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [markRemove, setMarkRemove] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedUrl = parseVideoUrl(urlValue);
  const activeVideoSrc = previewBlobUrl ?? (urlValue ? urlValue : publicVideoUrl(initialVideoUrl));

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlValue(e.target.value);
    setMarkRemove(false);
    setErrorMsg(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg(null);
    if (!file) return;

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setErrorMsg("Formato de video no válido. Se admiten archivos MP4 o WebM.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("El video supera el límite de 25 MB. Elige un video más corto o comprimido.");
      return;
    }

    setLocalFile(file);
    setPreviewBlobUrl(URL.createObjectURL(file));
    setMarkRemove(false);
  };

  const handleClearSelection = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLocalFile(null);
    setPreviewBlobUrl(null);
    setUrlValue("");
    setErrorMsg(null);
  };

  const handleRemoveToggle = () => {
    setMarkRemove((prev) => {
      const next = !prev;
      if (next) {
        handleClearSelection();
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
      {/* Flag para borrar video al guardar */}
      {markRemove ? <input type="hidden" name={removeInputName} value="1" /> : null}

      {/* Selector de modo: Enlace de Redes Sociales vs Subir Archivo */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setTab("link")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            tab === "link"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="size-3.5" />
          Enlace (YouTube / Reels / TikTok)
        </button>

        <button
          type="button"
          onClick={() => setTab("file")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            tab === "file"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <UploadCloud className="size-3.5" />
          Subir archivo MP4 / WebM
        </button>
      </div>

      {/* Opción 1: Enlace externo */}
      {tab === "link" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={inputName} className="text-xs font-bold text-foreground">
            URL del video (YouTube Shorts, Instagram Reel, TikTok o enlace directo)
          </label>
          <div className="relative">
            <input
              id={inputName}
              name={inputName}
              type="url"
              placeholder="Ej. https://youtube.com/shorts/... o https://instagram.com/reel/..."
              value={urlValue}
              onChange={handleUrlChange}
              disabled={markRemove}
              className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {parsedUrl?.type === "youtube" ? (
            <span className="text-[0.75rem] font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Video de YouTube detectado
            </span>
          ) : parsedUrl?.type === "instagram" ? (
            <span className="text-[0.75rem] font-semibold text-pink-600 dark:text-pink-400">
              ✓ Reel de Instagram detectado
            </span>
          ) : parsedUrl?.type === "tiktok" ? (
            <span className="text-[0.75rem] font-semibold text-cyan-600 dark:text-cyan-400">
              ✓ Video de TikTok detectado
            </span>
          ) : null}
        </div>
      ) : (
        /* Opción 2: Subida de archivo directo */
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            id={fileInputName}
            name={fileInputName}
            accept="video/mp4,video/webm"
            onChange={handleFileChange}
            className="sr-only"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-card p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Film className="size-5" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {localFile ? localFile.name : "Seleccionar video MP4 o WebM (máx. 25 MB)"}
            </p>
            <span className="text-[0.7rem] text-muted-foreground">
              {localFile
                ? `${(localFile.size / (1024 * 1024)).toFixed(2)} MB - Haz clic para cambiarlo`
                : "Ideal para clips cortos tipo reel publicitario"}
            </span>
          </div>
        </div>
      )}

      {/* Previsualización del video si existe */}
      {activeVideoSrc && !markRemove ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Video className="size-3.5 text-primary" />
              Vista previa del video
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[0.75rem] font-medium text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
              {initialVideoUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveToggle}
                  className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-destructive hover:underline"
                >
                  <Trash2 className="size-3" />
                  Quitar video
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative aspect-video max-h-56 w-full overflow-hidden rounded-lg bg-black">
            {parsedUrl?.embedUrl ? (
              <iframe
                src={parsedUrl.embedUrl}
                title="Vista previa del video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="h-full w-full border-0"
              />
            ) : (
              <video
                src={activeVideoSrc}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              >
                Tu navegador no soporta el reproductor de video.
              </video>
            )}
          </div>
        </div>
      ) : null}

      {/* Alerta de eliminación */}
      {markRemove ? (
        <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
          <span>El video se eliminará de este producto al guardar.</span>
          <button
            type="button"
            onClick={handleRemoveToggle}
            className="font-bold underline hover:no-underline"
          >
            Cancelar
          </button>
        </div>
      ) : null}

      {/* Mensaje de error */}
      {errorMsg ? (
        <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : null}
    </div>
  );
}
