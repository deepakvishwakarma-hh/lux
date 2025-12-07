import { MedusaService } from "@medusajs/framework/utils"
import LikedProduct from "./models/liked_product"

class LikedProductModuleService extends MedusaService({
    LikedProduct,
}) { }

export default LikedProductModuleService

