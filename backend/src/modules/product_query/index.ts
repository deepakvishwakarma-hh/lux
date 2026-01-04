import { Module } from "@medusajs/framework/utils"
import ProductQueryModuleService from "./service"

export const PRODUCT_QUERY_MODULE = "productQuery"

export default Module(PRODUCT_QUERY_MODULE, {
  service: ProductQueryModuleService,
})

