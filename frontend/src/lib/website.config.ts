/**
 * Website Configuration
 * Centralized configuration for all brand-related information
 * Update this file to change brand details across the entire website
 */

export const websiteConfig = {
    // Brand Identity
    name: "brand.luxuriousonly.com",
    tagline: "Brand Luxurious Only",
    shortName: "luxuriousonly",
    displayName: "brand.luxuriousonly.com",

    // Contact Information
    contact: {
        email: "support@luxuriousonly.com",
        emailLink: "mailto:support@luxuriousonly.com",
        businessHours: {
            weekdays: "Mon-Sat, 10:00 AM - 7:00 PM IST",
            sunday: "Closed",
        },
    },

    // Logo Configuration
    logo: {
        path: "/logo.avif",
        alt: "brand.luxuriousonly.com",
        desktop: {
            width: 205,
            height: 66,
        },
        mobile: {
            width: 160,
            height: 50,
        },
    },

    // Domain & URLs
    domain: "brand.luxuriousonly.com",
    websiteUrl: "https://brand.luxuriousonly.com",

    // Social Media (add as needed)
    social: {
        // facebook: "",
        // instagram: "",
        // twitter: "",
    },

    // Company Information
    company: {
        description: "Explore Designer Luxury Eyewear at brand.luxuriousonly.com. Our exclusive collection of premium Sunglasses, Eyeglasses & Frames offers unmatched quality and style.",
        copyright: `© ${new Date().getFullYear()} brand.luxuriousonly.com — All Rights Reserved`,
    },

    // SEO Defaults
    seo: {
        defaultTitle: "brand.luxuriousonly.com",
        defaultDescription: "Your destination for designer luxury eyewear including premium sunglasses, eyeglasses, and frames.",
    },
} as const

// Helper functions for common use cases
export const getBrandName = () => websiteConfig.name
export const getBrandDisplayName = () => websiteConfig.displayName
export const getBrandShortName = () => websiteConfig.shortName
export const getContactEmail = () => websiteConfig.contact.email
export const getLogoPath = () => websiteConfig.logo.path
export const getCopyright = () => websiteConfig.company.copyright

