import { getTranslations } from 'next-intl/server'
import { NewHomePageClient } from "@/components/home/new-home-page-client"
import { JsonLdServer } from "@/components/seo/json-ld-server"

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://filemarkd.com'

  const localizedBase = (loc: string): string =>
    loc === 'en' ? baseUrl : `${baseUrl}/${loc}`

  const url = localizedBase(locale)
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const description = t('description')

  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FileMarkd',
    url,
    description,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'FileMarkd',
      url: baseUrl,
    },
  }

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FileMarkd',
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    sameAs: [],
  }

  const softwareApplicationLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FileMarkd',
    url,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FileMarkd',
      url: baseUrl,
    },
  }

  return (
    <>
      <JsonLdServer data={webSiteLd} />
      <JsonLdServer data={organizationLd} />
      <JsonLdServer data={softwareApplicationLd} />
      <NewHomePageClient />
    </>
  )
}
