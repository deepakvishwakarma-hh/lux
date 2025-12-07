import { Module } from "@medusajs/framework/utils"
import LikedProductModuleService from "./service"

export const LIKED_PRODUCT_MODULE = "likedProduct"

export default Module(LIKED_PRODUCT_MODULE, {
    service: LikedProductModuleService,
})

