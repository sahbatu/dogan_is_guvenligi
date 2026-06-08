/** Kullanıcı girişini sayıya çevirir (1250, 1.250,50, 1250.50 vb.) */
export function parsePriceInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = trimmed
    .replace(/₺/g, '')
    .replace(/\s/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.')

  const num = Number.parseFloat(normalized)
  return Number.isFinite(num) && num >= 0 ? num : null
}

/** Input alanı için ham değer */
export function priceToInputValue(price: number | null | undefined): string {
  if (price == null) return ''
  return String(price)
}
