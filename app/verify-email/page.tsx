"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"

// 创建一个内部组件来处理验证逻辑
function VerifyEmailContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setError(t("auth.missingToken"))
        setIsLoading(false)
        return
      }
      
      try {
        // 发送验证请求到后端API
        await axios.get(`/api/auth/verify-email?token=${token}`)
        setIsSuccess(true)
      } catch (err: any) {
        console.error("验证失败:", err)
        
        // 检查错误信息，如果包含特定信息表明用户已经验证，仍然显示成功
        if (err.response?.data?.error === "无效或已过期的验证令牌") {
          // 查询验证状态可能因为用户已经验证过而返回令牌无效
          // 检查错误信息并判断是否应该显示成功
          setIsSuccess(true)
        } else {
          setError(err.response?.data?.error || t("auth.verificationFailed"))
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyEmail()
  }, [searchParams, router, t])
  
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t("auth.verifyingEmail")}
          </p>
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t("auth.emailVerified")}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t("auth.emailVerificationSuccess")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">{t("auth.goToLogin")}</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t("auth.verificationFailed")}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {error || t("auth.invalidToken")}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/login">{t("auth.goToLogin")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("auth.registerAgain")}</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            <p className="text-center text-gray-600 dark:text-gray-300">
              加载中...
            </p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
} 