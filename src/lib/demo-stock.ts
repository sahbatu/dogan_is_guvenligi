import type { Product } from '@/lib/supabase'

const STORAGE_KEY = 'dogan-demo-stock'

export function getDemoStockOverrides(): Record<string, number | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number | null>) : {}
  } catch {
    return {}
  }
}

export function updateDemoStock(updates: Record<string, number | null>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...getDemoStockOverrides(), ...updates }),
  )
}

export function applyDemoStockOverrides(products: Product[]): Product[] {
  const overrides = getDemoStockOverrides()
  return products.map((product) =>
    product.id in overrides ? { ...product, stock: overrides[product.id] } : product,
  )
}
