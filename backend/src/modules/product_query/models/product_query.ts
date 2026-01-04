import { model } from "@medusajs/framework/utils"

const ProductQuery = model.define("product_query", {
    id: model.id().primaryKey(),
    type: model.enum(["question", "custom_delivery", "customize_product"]),
    product_id: model.text().index("IDX_PRODUCT_QUERY_PRODUCT_ID"),
    customer_name: model.text(),
    customer_email: model.text().index("IDX_PRODUCT_QUERY_CUSTOMER_EMAIL"),
    customer_mobile: model.text(),
    subject: model.text(),
    message: model.text(),
    address: model.json(),
    status: model.enum(["new", "read", "responded"]).default("new"),
})

export default ProductQuery

