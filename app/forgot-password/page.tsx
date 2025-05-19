"use client"

import { useState } from "react"
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
import { Mail } from "lucide-react"

// 表单验证schema
const formSchema = z.object({
  email: z.string().email("请输入有效的电子邮件地址"),
})

type ForgotPasswordForm = z.infer<typeof formSchema>

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordForm) {
    try {
      setIsSubmitting(true)
      
      await axios.post("/api/auth/forgot-password", values)
      
      setIsSubmitted(true)
      toast.success(t("auth.sendResetLink"))
    } catch (error) {
      console.error("发送重置密码邮件失败:", error)
      toast.error(t("auth.loginError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {t("auth.forgotPasswordTitle")}
        </h1>
        
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {t("auth.resetEmailSent")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">{t("auth.returnToLogin")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              {t("auth.forgotPasswordDesc")}
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
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
                  {isSubmitting ? t("auth.sending") : t("auth.sendResetLink")}
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
      </div>
    </div>
  )
} 