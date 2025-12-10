import React from "react"

export type WoodMartIconProps = {
  iconContent: string
  className?: string
  style?: React.CSSProperties
  size?: string | number
  color?: string
  badge?: number | null
  badgeClassName?: string
  badgeStyle?: React.CSSProperties
  showBadgeWhenZero?: boolean
} & React.HTMLAttributes<HTMLSpanElement>

const WoodMartIcon: React.FC<WoodMartIconProps> = ({
  iconContent,
  className = "",
  style,
  size = "20",
  color = "currentColor",
  badge,
  badgeClassName = "",
  badgeStyle,
  showBadgeWhenZero = false,
  ...attributes
}) => {
  // Convert hex code (e.g., "f128", "\uf128", or "\\uf128") to Unicode character
  const getUnicodeChar = (content: string): string => {
    // Remove any escape characters and extract hex code
    let hexCode = content

    // Handle escaped Unicode sequences like "\\uf128" or "\uf128"
    if (content.includes("\\u")) {
      hexCode = content.replace(/.*\\u([0-9a-fA-F]{4}).*/, "$1")
    }
    // Handle hex strings like "f128" or "0xf128"
    else if (content.startsWith("0x") || content.startsWith("0X")) {
      hexCode = content.substring(2)
    }
    // If it's already just hex digits
    else if (/^[0-9a-fA-F]{1,6}$/.test(content)) {
      hexCode = content
    }
    // Otherwise, might already be a character, return as-is
    else {
      return content
    }

    // Convert hex to Unicode character
    const codePoint = parseInt(hexCode, 16)
    if (!isNaN(codePoint) && codePoint > 0) {
      return String.fromCharCode(codePoint)
    }

    return content
  }

  const iconChar = getUnicodeChar(iconContent)

  const baseStyle: React.CSSProperties = {
    fontFamily: "woodmart-font",
    fontSize: typeof size === "number" ? `${size}px` : size,
    color,
    ...style,
  }

  const combinedClassName = `woodmart-icon ${className}`.trim()

  // Show badge if badge is defined (including 0), hide if null or undefined
  const shouldShowBadge = badge !== undefined && badge !== null
  const badgeDisplayValue =
    badge !== undefined && badge !== null ? (badge > 99 ? "99+" : badge) : 0

  return (
    <span className="relative inline-flex items-center" {...attributes}>
      <span className={combinedClassName} style={baseStyle}>
        {iconChar}
      </span>
      {shouldShowBadge && (
        <span
          className={`absolute -top-2  -right-2   bg-black text-white rounded-full w-[15px] h-[15px] flex items-center justify-center ${badgeClassName}`}
          style={{
            fontSize: "9px",
            lineHeight: "1",
            ...badgeStyle,
          }}
        >
          {badgeDisplayValue}
        </span>
      )}
    </span>
  )
}

export default WoodMartIcon
