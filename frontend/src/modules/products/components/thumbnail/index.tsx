import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  imageClassName?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  imageClassName,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        // Use a taller aspect ratio on small screens and square on sm+
        "relative w-full overflow-hidden p-3 bg-white shadow-elevation-card-rest-- rounded-large-- group-hover:shadow-elevation-card-hover-- transition-shadow-- ease-in-out duration-150 aspect-[4/5] sm:aspect-square",
        className
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder
        image={initialImage}
        size={size}
        imageClassName={imageClassName}
      />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  imageClassName,
}: Pick<ThumbnailProps, "size" | "imageClassName"> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      // we changed object-cover to object-contain to avoid cropping the image
      className={`absolute inset-0 object-contain object-center ${
        imageClassName || ""
      }`}
      draggable={false}
      quality={100}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
