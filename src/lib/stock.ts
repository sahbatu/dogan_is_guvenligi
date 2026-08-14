export function normalizeProductStock(value: unknown): number | null {
  if (value == null || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.trunc(num)
}

/** Sitede stok rozeti yalnızca girilmiş ve pozitif stokta gösterilir. */
export function shouldShowPublicStock(stock: number | null | undefined): stock is number {
  return stock != null && stock > 0
}

export function parseStockInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const num = Number.parseInt(trimmed, 10)
  return Number.isFinite(num) && num >= 0 ? num : null
}

export function stockToInputValue(stock: number | null | undefined): string {
  if (stock == null) return ''
  return String(stock)
}

export function formatStock(stock: number | null | undefined): string | null {
  if (stock == null) return null
  return `${stock} adet`
}

export function getSchemaStockAvailability(
  stock: number | null | undefined,
): 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' {
  // Stok adedi girilmemiş ürünler siparişe açıktır; teslim süresi ayrıca
  // teklif/iletişim sürecinde netleşir. Bu nedenle şemada satın alınabilir
  // ürün olarak bildirilir, yalnızca açıkça 0 olanlar OutOfStock kalır.
  if (stock == null) return 'https://schema.org/InStock'
  return stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
}
