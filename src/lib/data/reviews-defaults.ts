export type ReviewItem = {
  id: string;
  autor: string;
  avatarInicial: string;
  rating: number; // 1-5
  fecha: string;
  sedeSlug: "belen" | "ambala";
  sedeNombre: string;
  comentario: string;
  destacada: boolean;
};

export const REVIEWS_SUMMARY = {
  calificacionPromedio: 4.6,
  totalResenas: 86,
  distribucion: {
    5: 72,
    4: 10,
    3: 3,
    2: 1,
    1: 0,
  },
};

export const VERIFIED_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    autor: "Valentina Gómez",
    avatarInicial: "V",
    rating: 5,
    fecha: "Hace 2 semanas",
    sedeSlug: "belen",
    sedeNombre: "Belén",
    comentario:
      "Los waffles y las ensaladas de frutas son espectaculares. Las porciones son súper generosas y la fruta siempre fresca. El ambiente en Belén cerca al museo es hermoso para compartir en familia.",
    destacada: true,
  },
  {
    id: "rev-2",
    autor: "Carlos Eduardo Méndez",
    avatarInicial: "C",
    rating: 5,
    fecha: "Hace 3 semanas",
    sedeSlug: "ambala",
    sedeNombre: "Ambalá",
    comentario:
      "Excelente opción en la Av. Ambalá. Los helados artesanales tienen una textura cremosa increíble y los crepes con nutella y fresas son de otro mundo. La atención fue rápida y muy amable.",
    destacada: true,
  },
  {
    id: "rev-3",
    autor: "Mariana Ospina",
    avatarInicial: "M",
    rating: 5,
    fecha: "Hace 1 mes",
    sedeSlug: "belen",
    sedeNombre: "Belén",
    comentario:
      "Las copas de helado y los cholados tienen una presentación impecable. Muy buena relación calidad-precio y el espacio es perfecto para tardear y tomar fotos.",
    destacada: true,
  },
  {
    id: "rev-4",
    autor: "Andrés Felipe Ruiz",
    avatarInicial: "A",
    rating: 5,
    fecha: "Hace 1 mes",
    sedeSlug: "ambala",
    sedeNombre: "Ambalá",
    comentario:
      "Probé el crepe de pollo con champiñones y una copa tentación de postre. Todo súper rico y fresco. El mejor lugar para tardear en Ibagué con amigos o en pareja.",
    destacada: true,
  },
  {
    id: "rev-5",
    autor: "Camila Morales",
    avatarInicial: "C",
    rating: 4,
    fecha: "Hace 1 mes",
    sedeSlug: "belen",
    sedeNombre: "Belén",
    comentario:
      "El sabor de los helados es insuperable y el lugar es muy limpio y bonito. Los fines de semana se llena bastante porque es muy popular, pero la espera vale totalmente la pena.",
    destacada: false,
  },
  {
    id: "rev-6",
    autor: "Juan Sebastián Lozano",
    avatarInicial: "J",
    rating: 5,
    fecha: "Hace 2 meses",
    sedeSlug: "ambala",
    sedeNombre: "Ambalá",
    comentario:
      "Delicioso el cholado tradicional con bastante lechera y helado. Muy cómodo el local de Ambalá y fácil de parquear cerca. 100% recomendado.",
    destacada: false,
  },
];
