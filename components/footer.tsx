"use client"

import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
            <path d="M9 17h6" />
            <path d="M9 13h6" />
          </svg>
          <span>PDF2MD © {currentYear}</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms-of-service" className="text-xs hover:underline underline-offset-4">
            {t("footer.terms")}
          </Link>
          <Link href="/contact-us" className="text-xs hover:underline underline-offset-4">
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
