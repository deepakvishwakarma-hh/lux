"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BrandLinkProps = {
  brandSlug: string
  brandName: string
}

export default function BrandLink({ brandSlug, brandName }: BrandLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  return (
    <LocalizedClientLink
      href={`/brands/${brandSlug}`}
      onClick={handleClick}
      className="text-ui-fg-subtle text-center text-sm my-1 hover:text-ui-fg-base transition-colors"
    >
      {brandName}
    </LocalizedClientLink>
  )
}
