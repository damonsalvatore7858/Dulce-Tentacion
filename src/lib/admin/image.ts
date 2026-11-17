// Detecta el tipo REAL de imagen por sus primeros bytes (no por la extensión ni el MIME del navegador).
export type ImageKind = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

export function detectImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((value, index) => bytes[index] === value)) {
    return { mime: "image/png", ext: "png" };
  }
  const ascii = (start: number, text: string) =>
    [...text].every((char, index) => bytes[start + index] === char.charCodeAt(0));
  if (bytes.length >= 12 && ascii(0, "RIFF") && ascii(8, "WEBP")) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

// Límite de subida: 10 MB para soportar fotos en alta resolución desde smartphones o cámaras.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
