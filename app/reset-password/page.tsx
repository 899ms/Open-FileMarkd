"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

// 表单验证schema
const formSchema = z.object({
  password: z.string().min(6, "密码至少需要6个字符"),
  confirmPassword: z.string().min(6, "密码至少需要6个字符"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不匹配",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof formSchema>

// 包裹在Suspense中使用useSearchParams的组件
function ResetPasswordForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast.error(t("auth.invalidToken"))
      router.push("/login")
      return
    }
    setToken(tokenParam)
  }, [searchParams, router, t])

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ResetPasswordForm) {
    if (!token) return

    try {
      setIsSubmitting(true)
      
      await axios.post("/api/auth/reset-password", {
        token,
        password: values.password,
      })
      
      setIsSuccess(true)
      toast.success(t("auth.resetSuccess"))
    } catch (error: any) {
      console.error("重置密码失败:", error)
      toast.error(error.response?.data?.error || t("auth.loginError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t("auth.resetSuccess")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">{t("auth.goToLogin")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            {t("auth.resetPasswordDesc")}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.newPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.resetting") : t("auth.resetPassword")}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:underline dark:text-blue-500"
            >
              {t("auth.returnToLogin")}
            </Link>
          </div>
        </>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {t("auth.resetPasswordTitle")}
        </h1>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
} 