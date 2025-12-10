import React from "react"

import { IconProps } from "types/icon"

const ShoppingCart: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M2.5 2.5H4.16667L5.00833 12.15C5.05 12.6417 5.33333 13.075 5.75 13.3083L14.1667 17.8083C14.8833 18.1917 15.7833 17.8917 16.1667 17.175C16.55 16.4583 16.25 15.5583 15.5333 15.175L7.75 11.25L7.08333 6.66667L16.6667 6.66667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.08334 17.5C7.77369 17.5 8.33334 16.9404 8.33334 16.25C8.33334 15.5596 7.77369 15 7.08334 15C6.39298 15 5.83334 15.5596 5.83334 16.25C5.83334 16.9404 6.39298 17.5 7.08334 17.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8333 17.5C16.5237 17.5 17.0833 16.9404 17.0833 16.25C17.0833 15.5596 16.5237 15 15.8333 15C15.143 15 14.5833 15.5596 14.5833 16.25C14.5833 16.9404 15.143 17.5 15.8333 17.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ShoppingCart
