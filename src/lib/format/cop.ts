// Formato de pesos colombianos: 18000 -> "$18.000".
// Agrupación manual para que sea idéntica en todos los navegadores e idiomas.
export function formatCOP(value: number): string {
  const rounded = Math.round(value);
  const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${rounded < 0 ? "-" : ""}$${grouped}`;
}
