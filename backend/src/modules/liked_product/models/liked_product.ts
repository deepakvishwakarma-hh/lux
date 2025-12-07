import { model } from "@medusajs/framework/utils"

const LikedProduct = model.define("liked_product", {
    id: model.id().primaryKey(),
    customer_id: model.text().index("IDX_LIKED_PRODUCT_CUSTOMER_ID"),
    product_id: model.text().index("IDX_LIKED_PRODUCT_PRODUCT_ID"),
})

export default LikedProduct

