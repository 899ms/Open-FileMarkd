"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, BadgeCheck, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PRICING } from "@/lib/stripe"
import { useAnalytics } from "@/hooks/use-analytics"

export function PricingSection() {
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [remainingDays, setRemainingDays] = useState<number | null>(null)
  const analytics = useAnalytics()

  // 计算年度节省的百分比和金额
  const monthlyPrice = 4.99
  const yearlyPrice = 49.9
  const savingsPercentage = Math.round(100 - (yearlyPrice / (monthlyPrice * 12)) * 100)
  const savingsAmount = (monthlyPrice * 12 - yearlyPrice).toFixed(2)

  const handleSubscription = async (plan: "monthly" | "yearly") => {
    try {
      if (!isAuthenticated) {
        setShowLoginDialog(true)
        analytics.trackEvent('subscription_login_required', 'subscription', plan)
        return
      }

      setIsLoading(true)
      setSubscriptionError(null)
      
      // 跟踪订阅开始事件
      analytics.trackSubscription('subscription_start', plan)
      
      // 调用API创建结账会话
      // 注意：服务端接口强制使用用户注册邮箱，禁止在Stripe页面修改
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          // 不再允许前端传递email，统一在服务端使用注册邮箱
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // 检查是否是"用户已有活跃订阅"的错误
        if (data.currentPlan && data.expiresAt && data.remainingDays) {
          setSubscriptionError(t(data.error))
          setRemainingDays(data.remainingDays)
          throw new Error(t(data.error))
        } else {
          throw new Error(data.error || t('subscription.failDescription'))
        }
      }
      
      // 重定向到Stripe结账页面
      if (data.url) {
        // 跟踪订阅重定向事件
        analytics.trackSubscription('subscription_redirect', plan)
        window.location.href = data.url
      } else {
        throw new Error('未返回支付URL')
      }
    } catch (error: any) {
      console.error('订阅处理错误:', error)
      // 跟踪订阅错误事件
      analytics.trackSubscription('subscription_error', plan, 0)
      analytics.trackEvent('subscription_error', 'subscription', error.message || 'unknown_error')
      
      toast({
        title: t('subscription.failTitle'),
        description: error.message || t('subscription.failDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 处理免费版"开始使用"按钮
  const handleGetStarted = () => {
    router.push('/#converter')
  }

  // 检查用户是否已有活跃订阅
  const hasActiveSubscription = user?.hasActiveSubscription === true

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">{t("pricing.title")}</h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("pricing.chooseYourPlan")}
            </p>
          </div>
          
          <Tabs defaultValue="yearly" className="w-full max-w-md my-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="monthly" 
                onClick={() => setBillingCycle("monthly")}
              >
                {t("pricing.monthlyPlan")}
              </TabsTrigger>
              <TabsTrigger 
                value="yearly"
                onClick={() => setBillingCycle("yearly")}
                className="relative"
              >
                <span>{t("pricing.yearlyPlan")}</span>
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {t("pricing.savePercent").replace("{percent}", savingsPercentage.toString())}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.free.title")}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">$0</span> /{" "}
                {t("pricing.forever")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.free.feature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.limitedConvertsPerMonth")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.fileSizeLimit.free")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.pageLimit.free")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  <span>{t("pricing.premium.feature4")}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleGetStarted}>
                {t("pricing.getStarted")}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-primary">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle>{t("pricing.premium.title")}</CardTitle>
              <CardDescription className="text-primary-foreground/90">
                <span className="text-3xl font-bold">
                  ${billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                </span> / {billingCycle === "monthly" ? t("pricing.month") : t("pricing.year")}
                {billingCycle === "yearly" && (
                  <div className="text-sm mt-1">
                    {t("pricing.monthlyEquivalent").replace("${price}", `$${(yearlyPrice / 12).toFixed(2)}`)}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span>{t("pricing.premium.feature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span>{t("pricing.unlimitedConvertsPerMonth")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium">{t("pricing.fileSizeLimit.premium")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium">{t("pricing.pageLimit.premium")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span>{t("pricing.premium.feature4")}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscription(billingCycle)}
                disabled={isLoading || hasActiveSubscription}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : hasActiveSubscription ? (
                  t("pricing.manageSubscription")
                ) : (
                  billingCycle === "monthly" ? t("pricing.monthlySubscribe") : t("pricing.yearlySubscribe")
                )}
              </Button>
              {hasActiveSubscription && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {t("pricing.activeSubscriptionHint")}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 登录提示对话框 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-dialog-content text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">{t('pricing.loginRequired.title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground opacity-100">
              {t('pricing.loginRequired.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 bg-background/50 rounded-md p-4 border border-border">
            <p className="text-sm text-muted-foreground opacity-100 font-medium">
              {t('pricing.loginRequired.benefits')}
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="default"
              className="w-full sm:w-auto" 
              onClick={() => {
                setShowLoginDialog(false)
                router.push('/login')
              }}
            >
              {t('common.login')}
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowLoginDialog(false)
                router.push('/register')
              }}
            >
              {t('common.register')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
