import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { SubscriptionSyncProvider } from "@/components/subscription-sync-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF to Markdown Converter | Fast & Free Online Tool",
  description: "Convert PDF files to Markdown format quickly and easily, with perfect formatting preservation. Free, fast and secure PDF to MD online tool with multilingual support.",
  generator: 'PDF2MD Conversion Engine',
  keywords: ["PDF to Markdown", "PDF转Markdown", "PDF to MD", "Markdown converter", "Markdown转换器", "online converter", "在线转换工具", "document conversion", "文档格式转换", "format preservation", "保留格式", "free PDF tool", "免费PDF工具", "OCR recognition", "OCR识别", "multilingual support", "多语言支持", "batch conversion", "批量转换"],
  authors: [{ name: "PDF2MD Team", url: "https://pdf2md.site" }],
  creator: "PDF2MD",
  publisher: "PDF2MD Technology",
  metadataBase: new URL("https://pdf2md.site"),
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en',
      'zh-CN': '/zh',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_CN",
    title: "PDF to Markdown Converter | Fast & Free Online Tool",
    description: "Convert PDF files to Markdown format with perfect formatting preservation. Supports multiple languages, high-precision OCR recognition, free, fast and secure.",
    siteName: "PDF2MD",
    url: "https://pdf2md.site",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF to Markdown Converter Tool Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Markdown Converter | Fast & Free Online Tool",
    description: "Convert PDF files to Markdown format with perfect formatting preservation. Supports multiple languages, high-precision OCR recognition.",
    creator: "@pdf2md",
    images: ["/og-image.png"],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // 替换为您的Google站点验证码
    yandex: "yandex-verification-code", // 如需在Yandex搜索引擎上收录，添加此行
    // 百度验证需要在other中设置，因为Verification类型中没有baidu属性
  },
  category: "technology",
  other: {
    "format-detection": "telephone=no",
    "theme-color": "#ffffff",
    "color-scheme": "light dark",
    "application-name": "PDF2MD",
    "apple-mobile-web-app-title": "PDF2MD",
    "baidu-site-verification": "baidu-site-verification-code", // 百度站点验证码
    // 添加结构化数据标记
    "schema:organization": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PDF2MD",
      "url": "https://pdf2md.site",
      "logo": "https://pdf2md.site/logo.png",
      "sameAs": ["https://twitter.com/zyailive", "https://github.com/ItusiAI"]
    }),
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  "mobile-web-app-capable": "yes",
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "default",
  "twitter:dnt": "on",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LanguageProvider>
              <SubscriptionSyncProvider>
                <Header />
                <main className="min-h-screen bg-background">
                  {children}
                </main>
                <Toaster />
                <AnalyticsProvider />
              </SubscriptionSyncProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'