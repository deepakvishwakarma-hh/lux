import { WEBSITE_DOMAIN } from "@lib/brand"

const DiscountBar = () => {
  return (
    <div className="bg-[#e5e5e5] mt-5">
      <h1 className="text-center text-[14px] font-bold p-3 uppercase">
        UP TO 50% OFF THE SUNGLASSES & EYEGLASSES - MADE WITH LOVE BY &nbsp;
        {WEBSITE_DOMAIN}
      </h1>
    </div>
  )
}

export default DiscountBar
