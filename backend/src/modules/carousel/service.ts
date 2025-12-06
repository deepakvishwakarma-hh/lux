import { MedusaService } from "@medusajs/framework/utils"
import Carousel from "./models/carousel"

class CarouselModuleService extends MedusaService({
    Carousel,
}) { }

export default CarouselModuleService

