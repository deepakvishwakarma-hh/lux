import { model } from "@medusajs/framework/utils"

const Carousel = model.define("carousel", {
    id: model.id().primaryKey(),
    image_url1: model.text().nullable(), // Desktop image
    image_url2: model.text().nullable(), // Mobile image
    link: model.text().nullable(),
    order: model.number().default(0),
})

export default Carousel

