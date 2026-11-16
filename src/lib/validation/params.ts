import { z } from "zod";

// Slug de sede/producto: minúsculas, números y guiones (igual que el CHECK de la BD).
export const slugSchema = z
  .string()
  .max(60)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

// Número de WhatsApp colombiano en formato internacional sin "+": 57 + 10 dígitos.
export const whatsappSchema = z.string().regex(/^57[0-9]{10}$/);
