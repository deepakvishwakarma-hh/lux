import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"
import { getBaseURL } from "@lib/util/env"

import ResetPassword from "@modules/account/components/reset-password"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const forgetPasswordUrl = `${baseURL}/${countryCode}/forget-password`

  const title = `Forgot Password | ${companyName}`
  const description = `Reset your password for your ${companyName} account. Enter your email to receive password reset instructions.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: forgetPasswordUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: forgetPasswordUrl,
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

export default function ForgetPasswordPage(props: Props) {
  return (
    <div className="w-full flex items-center justify-center px-8 py-8">
      <ResetPassword />
    </div>
  )
}
