import { listBrands } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import CategoryNav from "@modules/layout/components/category-nav"

export default async function CategoryNavigation() {
  const [brands, categories] = await Promise.all([
    listBrands().catch(() => ({ brands: [] })),
    listCategories().catch(() => []),
  ])

  const brandsList = brands.brands || []

  return <CategoryNav categories={categories} brands={brandsList} />
}
