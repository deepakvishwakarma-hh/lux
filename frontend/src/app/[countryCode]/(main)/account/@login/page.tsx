import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"
import { getBaseURL } from "@lib/util/env"

import LoginTemplate from "@modules/account/templates/login-template"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const loginUrl = `${baseURL}/${countryCode}/account/login`

  const title = `Sign In | ${companyName}`
  const description = `Sign in to your ${companyName} account to access your orders, wishlist, and personalized shopping experience.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: loginUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: loginUrl,
      siteName: companyName,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default function Login(props: Props) {
  return <LoginTemplate />
}
