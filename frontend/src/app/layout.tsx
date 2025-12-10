import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  other: {
    "woodmart-font":
      "https://db.onlinewebfonts.com/c/f890eea2e91e1270ce7109e36a42260a?family=woodmart-font",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={inter.variable}>
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/f890eea2e91e1270ce7109e36a42260a?family=woodmart-font"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
