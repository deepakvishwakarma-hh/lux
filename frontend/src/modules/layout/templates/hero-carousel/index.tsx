import { listCarousels } from "@lib/data/carousels"
import HeroCarousel from "@modules/layout/components/hero-carousel"

export default async function HeroCarouselTemplate() {
  const { carousels } = await listCarousels().catch(() => ({ carousels: [] }))

  return <HeroCarousel carousels={carousels} />
}

