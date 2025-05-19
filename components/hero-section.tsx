"use client"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, FileText, FileDown } from "lucide-react"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-1/3 -left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="animate-pulse rounded-full bg-primary h-2 w-2 mr-2"></span>
              {t("hero.converter")}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
                {t("hero.title")}
              </h1>
              <p className="max-w-[600px] text-xl text-muted-foreground md:text-2xl">{t("hero.subtitle")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/#converter">
                <Button size="lg" className="group px-8 h-12 text-lg">
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/#features">
                <Button variant="outline" size="lg" className="h-12 text-lg">
                  {t("hero.learnMore")}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>{t("hero.formatPreservation")}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                <span>{t("hero.quickDownload")}</span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] lg:h-[550px] lg:w-[550px]">
              {/* Main image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background">
                  <div className="absolute top-0 left-0 right-0 h-10 bg-muted flex items-center px-4 border-b border-border/50">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="pt-10 p-6">
                    <div className="flex gap-4">
                      <div className="w-1/2 space-y-4">
                        <div className="h-8 w-full rounded bg-primary/10 animate-pulse"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-3/4 rounded bg-muted"></div>
                        <div className="h-4 w-5/6 rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-2/3 rounded bg-muted"></div>
                      </div>
                      <div className="w-1/2 space-y-4">
                        <div className="h-8 w-full rounded bg-primary/10 animate-pulse"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-3/4 rounded bg-muted"></div>
                        <div className="h-4 w-5/6 rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                      </div>
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="h-4 w-full rounded bg-muted"></div>
                      <div className="h-4 w-5/6 rounded bg-muted"></div>
                      <div className="h-4 w-full rounded bg-muted"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-1/4 -left-4 h-16 w-16 rounded-lg bg-primary/10 border border-primary/20 shadow-lg flex items-center justify-center animate-bounce">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div
                className="absolute bottom-1/4 -right-4 h-16 w-16 rounded-lg bg-primary/10 border border-primary/20 shadow-lg flex items-center justify-center animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                <FileDown className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
