import type { Product } from '@/lib/supabase'

const STORAGE_KEY = 'dogan-demo-prices'

export function getDemoPriceOverrides(): Record<string, number | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number | null>) : {}
  } catch {
    return {}
  }
}

export function updateDemoPrices(updates: Record<string, number | null>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...getDemoPriceOverrides(), ...updates }),
  )
}

export function applyDemoPriceOverrides(products: Product[]): Product[] {
  const overrides = getDemoPriceOverrides()
  return products.map((product) =>
    product.id in overrides ? { ...product, price: overrides[product.id] } : product,
  )
}
