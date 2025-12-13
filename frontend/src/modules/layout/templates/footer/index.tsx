"use client"

import { useState } from "react"
import { FaPhone, FaEnvelope } from "react-icons/fa"
import { IoArrowUp } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WEBSITE_DOMAIN, WEBSITE_NAME } from "@lib/brand"

const Footer = () => {
  const [email, setEmail] = useState("")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <>
      {/* Top Section */}
      {/* <div className="w-full bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Shop Glasses, Sunglasses, Prescription Sunglasses & Eyeglasses Online
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-4xl">
            {WEBSITE_DOMAIN !== "none" ? WEBSITE_DOMAIN : "luxuriousmart.com"} is
            a leading e-commerce portal for eyewear in the USA. We offer a large
            online selection of authentic designer luxury sunglasses, eyeglasses,
            and frames. Our sunglasses and eyeglasses are available for men and
            women in diverse styles and trendy colors.
          </p>
        </div>
      </div> */}

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {/* About Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">About</h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  Explore Designer Luxury Eyewear at luxuryeyewear.in Our
                  exclusive collection of premium Sunglasses, Eyeglasses,
                  Glasses & Frames offers unmatched quality and style. Join the
                  elite who appreciate the finer things. Elevate your look with
                  our timeless elegance. Order today and embrace sophistication.
                </p>
                <div className="pt-2 space-y-2">
                  <p className="flex items-center gap-2">
                    <FaPhone className="text-gray-300" size={14} />
                    <a
                      href="tel:+919871981806"
                      className="hover:text-white transition-colors"
                    >
                      +91 9871981806
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-300" size={14} />
                    <a
                      href="mailto:support@luxuryeyewear.in"
                      className="hover:text-white transition-colors"
                    >
                      support@luxuryeyewear.in
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Information
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink
                    href="/about-us"
                    className="hover:text-white transition-colors"
                  >
                    About us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contact-us"
                    className="hover:text-white transition-colors"
                  >
                    Contact us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/return-refund-policy"
                    className="hover:text-white transition-colors"
                  >
                    Return & Refund Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/delivery-shipping"
                    className="hover:text-white transition-colors"
                  >
                    Delivery & Shipping
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms-conditions"
                    className="hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Shop By Popular Brands Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Shop By Popular Brands
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink
                    href="/brands/burberry"
                    className="hover:text-white transition-colors"
                  >
                    Burberry Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/carrera"
                    className="hover:text-white transition-colors"
                  >
                    Carrera Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/gucci"
                    className="hover:text-white transition-colors"
                  >
                    Gucci Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/ic-berlin"
                    className="hover:text-white transition-colors"
                  >
                    Ic Berlin Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/tom-ford"
                    className="hover:text-white transition-colors"
                  >
                    Tom Ford Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/versace"
                    className="hover:text-white transition-colors"
                  >
                    Versace Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/philippe-charriol"
                    className="hover:text-white transition-colors"
                  >
                    Philippe Charriol Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands"
                    className="hover:text-white transition-colors font-medium"
                  >
                    View All Eyewear Brands
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Quick Shop Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Quick Shop
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink
                    href="/sunglasses"
                    className="hover:text-white transition-colors"
                  >
                    Shop sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/sunglasses/men"
                    className="hover:text-white transition-colors"
                  >
                    Sunglasses for Man
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/sunglasses/women"
                    className="hover:text-white transition-colors"
                  >
                    Sunglasses for Women
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/sunglasses/kids"
                    className="hover:text-white transition-colors"
                  >
                    Kids Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses"
                    className="hover:text-white transition-colors"
                  >
                    Shop Glasses Frames
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses/men"
                    className="hover:text-white transition-colors"
                  >
                    Glasses for men
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses/women"
                    className="hover:text-white transition-colors"
                  >
                    Glasses for women
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Newsletter & Quick Links Column */}
            <div>
              {/* Newsletter Sign Up */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4">
                  Newsletter Sign Up
                </h3>
                <p className="text-sm mb-4">
                  Sign up for new arrivals, offers, and more!
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="flex-1 px-4 py-2 bg-white border border-white rounded-l text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    type="submit"
                    className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2 px-6 rounded-r transition-colors uppercase text-sm whitespace-nowrap"
                  >
                    SEND
                  </button>
                </form>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <LocalizedClientLink
                      href="/account"
                      className="hover:text-white transition-colors"
                    >
                      My Account
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/wishlist"
                      className="hover:text-white transition-colors"
                    >
                      Wishlist
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/track-order"
                      className="hover:text-white transition-colors"
                    >
                      Track Your Order
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-black w-full">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center items-center relative">
            <p className="text-white text-xs md:text-sm text-center">
              Copyright © 2025 Luxuryeyewear.In All Rights Reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="absolute right-4 w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Scroll to top"
            >
              <IoArrowUp className="text-gray-900" size={18} />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
