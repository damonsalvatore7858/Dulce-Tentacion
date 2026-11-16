export const CLICK_CHANNELS = ["whatsapp_fab", "whatsapp_sede", "whatsapp_pedido", "como_llegar"] as const;
export type ClickChannel = (typeof CLICK_CHANNELS)[number];

export const CHANNEL_LABELS: Record<ClickChannel, string> = {
  whatsapp_fab: "Botón flotante de WhatsApp",
  whatsapp_sede: "WhatsApp en fichas de sede",
  whatsapp_pedido: "Pedido enviado a WhatsApp",
  como_llegar: "Cómo llegar",
};
