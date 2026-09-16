import type React from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/home/site-chrome'

const locales = ['en', 'zh-CN', 'ja', 'ko', 'zh-TW']

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://filemarkd.com'

function resolveLocale(locale: string) {
  if (locale === 'zh-CN') return 'zh_CN'
  if (locale === 'zh-TW') return 'zh_TW'
  if (locale === 'ja') return 'ja_JP'
  if (locale === 'ko') return 'ko_KR'
  return 'en_US'
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata' })

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_BASE_URL

  const localizedBase = (loc: string): string =>
    loc === 'en' ? baseUrl : `${baseUrl}/${loc}`

  const currentUrl = localizedBase(locale)
  const ogImageUrl = `${baseUrl}/images/og.png`

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('shortTitle')}`,
    },
    description: t('description'),
    keywords: t('keywords'),
    applicationName: 'FileMarkd',
    authors: [{ name: 'FileMarkd Team', url: 'https://filemarkd.com' }],
    creator: 'FileMarkd',
    publisher: 'FileMarkd',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    manifest: '/manifest.json',
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,
      languages: {
        'x-default': baseUrl,
        'en': baseUrl,
        'zh-CN': `${baseUrl}/zh-CN`,
        'zh-TW': `${baseUrl}/zh-TW`,
        'ja': `${baseUrl}/ja`,
        'ko': `${baseUrl}/ko`,
      },
    },
    openGraph: {
      type: 'website',
      locale: resolveLocale(locale),
      url: currentUrl,
      title: t('title'),
      description: t('description'),
      siteName: 'FileMarkd',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      creator: 'FileMarkd',
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    other: {
      'theme-color': '#00F0FF',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'FileMarkd',
    },
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div data-locale={locale}>
        <SiteChrome>{children}</SiteChrome>
      </div>
    </NextIntlClientProvider>
  )
}
