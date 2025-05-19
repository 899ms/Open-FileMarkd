'use client'

import { memo } from 'react'

interface JsonLdProps {
  data: Record<string, any>
}

export const JsonLd = memo(function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
})

export const WebsiteJsonLd = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://pdf2md.site',
    name: 'PDF to Markdown Converter',
    description: 'Convert PDF files to Markdown format with perfect formatting preservation. Supports multiple languages, free, fast and secure.',
    inLanguage: ['en', 'zh'],
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://pdf2md.site/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return <JsonLd data={data} />
}

export const SoftwareApplicationJsonLd = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDF to Markdown Converter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Free Version',
        description: 'Basic features free to use'
      },
      {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        name: 'Premium Monthly Subscription',
        description: 'Advanced features including batch conversion and premium format support'
      },
      {
        '@type': 'Offer',
        price: '99.99',
        priceCurrency: 'USD',
        name: 'Premium Annual Subscription',
        description: 'Advanced features with annual discount'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
      bestRating: '5',
      worstRating: '1'
    },
    featureList: 'Text recognition with format preservation, High-quality PDF conversion, Multilingual support',
    screenshot: 'https://pdf2md.site/screenshots/app-screenshot.png',
    softwareHelp: 'https://pdf2md.site/faq',
    softwareVersion: '2.0',
    fileSize: 'Web-based'
  }

  return <JsonLd data={data} />
}

export const FAQJsonLd = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Currently supports PDF to Markdown, more formats coming soon.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is it free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Basic features are free, premium features require a subscription.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where are converted files saved?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Converted files are automatically downloaded to your device.'
        }
      },
      {
        '@type': 'Question',
        name: 'How to subscribe to the premium plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can choose either monthly or yearly subscription on the pricing page and get immediate access to all premium features after payment.'
        }
      }
    ]
  }

  return <JsonLd data={data} />
}

export const OrganizationJsonLd = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PDF2MD',
    url: 'https://pdf2md.site',
    logo: 'https://pdf2md.site/logo.png',
    sameAs: ['https://twitter.com/pdf2md', 'https://github.com/pdf2md'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@pdf2md.site',
      availableLanguage: ['English', 'Chinese']
    }
  }

  return <JsonLd data={data} />
}

export const BreadcrumbJsonLd = ({ items }: { items: Array<{ name: string, path: string }> }) => {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://pdf2md.site${item.path}`
  }))

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  }

  return <JsonLd data={data} />
} 