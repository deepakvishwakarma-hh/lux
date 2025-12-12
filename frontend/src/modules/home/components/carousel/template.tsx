import { listCarousels } from "@lib/data/carousels"
import HomeCarousel from "./index"

export default async function CarouselTemplate() {
  const { carousels } = await listCarousels()

  return (
    <div>
      <HomeCarousel carousels={carousels || []} />
    </div>
  )
}
