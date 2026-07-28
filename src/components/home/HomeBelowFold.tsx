import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { Services } from '@/components/home/Services'
import { WhyUs } from '@/components/home/WhyUs'
import { Stats } from '@/components/home/Stats'
import { Industries } from '@/components/home/Industries'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { CTA } from '@/components/home/CTA'
import { useProducts } from '@/hooks/useProducts'

export function HomeBelowFold() {
  const { products, categories, loading } = useProducts({ home: true })

  return (
    <>
      <CategoryShowcase categories={categories} products={products} loading={loading} />
      <Services />
      <WhyUs />
      <Stats />
      <Industries products={products} />
      <FeaturedProducts products={products} />
      <CTA />
    </>
  )
}
