import { MedusaService } from "@medusajs/framework/utils"
import ProductQuery from "./models/product_query"

class ProductQueryModuleService extends MedusaService({
  ProductQuery,
}) {}

export default ProductQueryModuleService

