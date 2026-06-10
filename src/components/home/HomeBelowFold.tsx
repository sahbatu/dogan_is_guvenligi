import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { Services } from '@/components/home/Services'
import { WhyUs } from '@/components/home/WhyUs'
import { Stats } from '@/components/home/Stats'
import { Industries } from '@/components/home/Industries'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { CTA } from '@/components/home/CTA'
import { useProducts } from '@/hooks/useProducts'

export function HomeBelowFold() {
  const { products } = useProducts()

  return (
    <>
      <CategoryShowcase />
      <Services />
      <WhyUs />
      <Stats />
      <Industries />
      <FeaturedProducts products={products} />
      <CTA />
    </>
  )
}
