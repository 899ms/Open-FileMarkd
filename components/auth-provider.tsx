"use client"

import React, { useEffect } from "react"
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { useRouter } from "next/navigation"

// 定义用户类型 - 用于TypeScript类型提示
export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  hasActiveSubscription?: boolean
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  stripeCurrentPeriodEnd?: Date | null
}

// 创建认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// 定义认证钩子函数
export function useAuth() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  
  const loading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user || null

  // 调试session状态
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('当前用户认证状态:', {
        hasActiveSubscription: user.hasActiveSubscription,
        id: user.id,
        subscription: user.stripeSubscriptionId
      });
    }
  }, [isAuthenticated, user]);

  // 登录函数 - 凭据方式
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      
      if (result?.error) {
        toast({
          title: t("auth.loginError"),
          variant: "destructive",
        })
        return false
      }
      
      toast({
        title: t("auth.loginSuccess"),
        variant: "default",
      })
      
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: t("auth.loginError"),
        variant: "destructive",
      })
      return false
    }
  }

  // 社交登录函数
  const socialLogin = async (provider: "github" | "google"): Promise<void> => {
    try {
      // 使用更可靠的配置处理OAuth
      await signIn(provider, { 
        callbackUrl: "/",
        redirect: true, // 使用重定向而不是在同一页面处理
      })
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast({
        title: t("auth.loginError"),
        variant: "destructive",
      })
    }
  }

  // 注册函数
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // 调用注册API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        toast({
          title: data.error || t("auth.registerError"),
          variant: "destructive",
        })
        return false
      }
      
      // 注册成功提示验证邮箱
      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.verificationEmailSent"),
        variant: "default",
      })
      
      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: t("auth.registerError"),
        variant: "destructive",
      })
      return false
    }
  }

  // 登出函数
  const logout = async () => {
    await signOut({ redirect: false })
    toast({
      title: t("auth.logoutSuccess"),
      variant: "default",
    })
    router.push('/')
  }

  return {
    user,
    loading,
    login,
    socialLogin,
    register,
    logout,
    isAuthenticated,
  }
} 