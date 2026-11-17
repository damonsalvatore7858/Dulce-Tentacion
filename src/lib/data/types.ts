export type Horario = { abre: string; cierra: string };

export type Sede = {
  id: string;
  slug: string;
  nombre: string;
  direccion: string;
  barrio: string | null;
  ciudad: string;
  whatsapp: string | null;
  telefono: string | null;
  maps_url: string | null;
  maps_embed_url: string | null;
  horarios: Record<string, Horario[]>;
  horario_nota: string | null;
  horario_nota_en: string | null;
  domicilios: boolean;
  orden: number;
};

export type Category = {
  id: string;
  slug: string;
  nombre: string;
  nombre_en: string | null;
  orden: number;
};

export type CatalogItem = {
  id: string;
  slug: string;
  nombre: string;
  nombre_en: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
  image_path: string | null;
  video_url?: string | null;
  destacado: boolean;
  es_ejemplo: boolean;
  category_id: string;
  precio_cop: number | null;
  disponible: boolean;
};

export type Promotion = {
  id: string;
  titulo: string;
  titulo_en: string | null;
  texto: string | null;
  texto_en: string | null;
  sede_id: string | null;
};

export type MomentPrice = {
  sede_id: string;
  precio_cop: number | null;
  disponible: boolean;
};

export type Moment = {
  slug: string;
  nombre: string;
  nombre_en: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
  image_path: string | null;
  video_url?: string | null;
  precios: MomentPrice[];
};
