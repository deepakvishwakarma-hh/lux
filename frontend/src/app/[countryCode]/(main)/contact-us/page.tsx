import { Metadata } from "next"
import { FaEnvelope } from "react-icons/fa"
import { websiteConfig } from "@lib/website.config"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const contactUrl = `${baseURL}/${countryCode}/contact-us`

  const title = `Contact Us | ${companyName}`
  const description = `Get in touch with ${companyName}. Contact us for inquiries, support, or assistance with your luxury eyewear needs. Email: ${websiteConfig.contact.email}`

  return {
    title,
    description,
    keywords: [
      "contact us",
      "customer service",
      companyName,
      "luxury eyewear support",
      websiteConfig.contact.email,
    ],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    alternates: {
      canonical: contactUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: contactUrl,
      siteName: companyName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default function ContactUsPage(props: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        
        <div className="space-y-8 text-gray-700">
          <p className="text-lg leading-relaxed">
            We'd love to hear from you! Whether you have a question about our products, need assistance 
            with an order, or want to provide feedback, our team is here to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaEnvelope className="text-blue-600" size={20} />
                <h3 className="text-xl font-semibold">Email</h3>
              </div>
              <p className="text-gray-600">
                <a href={websiteConfig.contact.emailLink} className="text-blue-600 hover:underline">
                  {websiteConfig.contact.email}
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-2">We typically respond within 24 hours</p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="leading-relaxed">
              For any inquiries about our products, orders, shipping, returns, or general questions, 
              please don't hesitate to reach out. Our customer service team is dedicated to providing 
              you with the best possible experience.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-2">
                <li><strong>Monday - Saturday:</strong> {websiteConfig.contact.businessHours.weekdays}</li>
                <li><strong>Sunday:</strong> {websiteConfig.contact.businessHours.sunday}</li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">What We Can Help With</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product inquiries and recommendations</li>
              <li>Order status and tracking</li>
              <li>Returns and refunds</li>
              <li>Shipping and delivery questions</li>
              <li>Account and payment assistance</li>
              <li>General customer support</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

