import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 定义登录表单验证schema
const formSchema = z.object({
  email: z.string().email("请输入有效的电子邮件地址"),
  password: z.string().min(1, "密码是必填项"),
})

type LoginForm = z.infer<typeof formSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // 初始化表单
  const form = useForm<LoginForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 提交表单
  async function onSubmit(values: LoginForm) {
    try {
      setIsLoading(true)
      
      // 发送登录请求
      const response = await axios.post("/api/auth/login", values)
      
      // 处理成功登录
      toast.success("登录成功")
      router.push("/dashboard")
      router.refresh() // 刷新页面以更新认证状态
      
    } catch (error: any) {
      console.error("登录失败:", error)
      // 显示错误消息
      toast.error(error.response?.data?.error || "登录失败，请检查您的凭据")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>密码</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-500"
                  >
                    忘记密码?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        没有账户?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline dark:text-blue-500"
        >
          注册
        </Link>
      </div>
    </div>
  )
} 