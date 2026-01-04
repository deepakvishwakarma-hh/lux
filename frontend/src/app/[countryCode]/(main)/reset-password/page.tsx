import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"
import { getBaseURL } from "@lib/util/env"

import ResetPasswordForm from "@modules/account/components/reset-password-form"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params
  const companyName = websiteConfig.name || websiteConfig.displayName
  const baseURL = getBaseURL()
  const resetPasswordUrl = `${baseURL}/${countryCode}/reset-password`

  const title = `Reset Password | ${companyName}`
  const description = `Reset your password for your ${companyName} account. Create a new secure password.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: resetPasswordUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: resetPasswordUrl,
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

export default function ResetPasswordPage(props: Props) {
  return (
    <div className="w-full flex items-center justify-center px-8 py-8">
      <ResetPasswordForm />
    </div>
  )
}

