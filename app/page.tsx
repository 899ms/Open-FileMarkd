import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ConverterSection } from "@/components/converter-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { 
  WebsiteJsonLd, 
  SoftwareApplicationJsonLd, 
  FAQJsonLd, 
  OrganizationJsonLd,
  BreadcrumbJsonLd
} from "./components/json-ld"

export default function Home() {
  // 首页面包屑
  const breadcrumbItems = [
    { name: '首页', path: '/' }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ConverterSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
      {/* 结构化数据 */}
      <WebsiteJsonLd />
      <SoftwareApplicationJsonLd />
      <FAQJsonLd />
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={breadcrumbItems} />
    </div>
  )
}
