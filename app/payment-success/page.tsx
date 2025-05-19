"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/components/language-provider'
import confetti from 'canvas-confetti'

// 创建一个内部组件来使用useSearchParams
function PaymentSuccessContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
    
    // 验证会话ID存在
    if (id) {
      // 这里可以调用API验证会话ID
      // 或者直接显示成功信息
      setIsLoading(false)
      
      // 触发撒花效果
      triggerConfetti()
    } else {
      // 如果没有会话ID，重定向到首页
      router.push('/')
    }
  }, [searchParams, router])
  
  // 触发撒花效果的函数
  const triggerConfetti = () => {
    // 左侧彩带
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 }
    });
    
    // 右侧彩带
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.6 }
      });
    }, 200);
    
    // 中间彩带
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        gravity: 0.8,
        scalar: 1.2,
        drift: 0
      });
    }, 400);
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 animate-pulse-slow">
          <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl animate-fade-in-up">{t("subscription.successTitle")}</CardTitle>
        <CardDescription className="animate-fade-in-up animation-delay-100">
          {t("subscription.successDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground animate-fade-in-up animation-delay-200">
          {t("subscription.activatedMessage")}
        </p>
        
        {sessionId && (
          <p className="mt-2 text-xs text-muted-foreground animate-fade-in-up animation-delay-300">
            {t("subscription.orderNumber")}: {sessionId}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 animate-fade-in-up animation-delay-400">
        <Button onClick={() => router.push('/')}>
          {t("subscription.backToHome")}
        </Button>
        <Button variant="outline" onClick={() => router.push('/#converter')}>
          {t("subscription.startUsing")}
        </Button>
      </CardFooter>
    </Card>
  )
}

// 创建一个加载状态组件
function PaymentSuccessLoading() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}

// 主页面组件使用Suspense包装内部组件
export default function PaymentSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
} 