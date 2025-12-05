import { model } from "@medusajs/framework/utils"

const Brand = model.define("brand", {
    id: model.id().primaryKey(),
    name: model.text(),
    description: model.text().nullable(),
    meta_title: model.text().nullable(),
    meta_desc: model.text().nullable(),
})

export default Brand

