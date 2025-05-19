"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Languages, Sparkles } from "lucide-react"

export function FeaturesSection() {
  const { t } = useLanguage()

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/30 to-muted/60">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">{t("features.title")}</h2>
            <p className="text-muted-foreground md:text-xl">{t("features.overview")}</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("features.text1")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t("features.desc1")}
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("features.text2")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t("features.desc2")}
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("features.text3")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{t("features.desc3")}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
