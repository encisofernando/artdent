export function formatMoney(n: number): string {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}
