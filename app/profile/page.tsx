"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { UsageLimitStatus } from "@/components/usage-limit-status"
import { SubscriptionInfo } from "@/components/subscription-info"

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])
  
  // 获取用户头像的首字母
  const getUserInitials = () => {
    if (!user || !user.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }
  
  // 显示加载中或未登录时的占位符
  if (loading || !isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-4 h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="mt-2 h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="text-4xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{t("auth.userProfile")}</CardTitle>
          <CardDescription>{t("auth.profileSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("auth.name")}</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("auth.email")}</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="font-medium">{user?.id}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            {/* 订阅信息 */}
            <div className="mb-4">
              <SubscriptionInfo />
            </div>

            {/* 使用次数 */}
            <div className="mb-4">
              <UsageLimitStatus />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {/* 移除了首页按钮 */}
        </CardFooter>
      </Card>
    </div>
  )
} 