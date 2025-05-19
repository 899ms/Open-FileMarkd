"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Mail, Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function RegisterPage() {
  const { t } = useLanguage()
  const { register, socialLogin, loading } = useAuth()
  const router = useRouter()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<"pending" | "success" | "error">("pending")
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  // 验证表单
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }

    // 验证用户名
    if (!name) {
      newErrors.name = t("auth.requiredField")
      isValid = false
    }

    // 验证邮箱
    if (!email) {
      newErrors.email = t("auth.requiredField")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail")
      isValid = false
    }

    // 验证密码
    if (!password) {
      newErrors.password = t("auth.requiredField")
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = t("auth.passwordMinLength")
      isValid = false
    }

    // 验证确认密码
    if (!confirmPassword) {
      newErrors.confirmPassword = t("auth.requiredField")
      isValid = false
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = t("auth.passwordMismatch")
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // 处理注册提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // 立即显示邮箱验证提示页面，提升用户体验
    setIsRegistered(true)
    setRegistrationStatus("pending")
    
    // 在后台处理注册请求
    const success = await register(name, email, password)
    if (!success) {
      // 如果注册失败，回到注册表单页面并显示错误
      setIsRegistered(false)
      toast.error(t("auth.registerError"))
    } else {
      setRegistrationStatus("success")
    }
  }

  // 社交登录处理 - 直接登录而不是注册
  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      setIsOAuthLoading(provider)
      // 显示提示消息，告知用户将直接登录
      toast.info(`您选择了使用${provider === "github" ? "GitHub" : "Google"}账号登录，将直接为您登录`);
      
      // 调用社交登录函数，直接登录
      await socialLogin(provider)
      
      // 登录成功后会自动重定向到首页，由socialLogin处理
    } catch (error) {
      console.error(`${provider} 登录失败:`, error)
      toast.error(`${provider} 登录失败，请稍后再试`)
    } finally {
      setIsOAuthLoading(null)
    }
  }

  if (isRegistered) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                {registrationStatus === "pending" ? (
                  <svg className="animate-spin h-8 w-8 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {registrationStatus === "pending" ? t("auth.registering") : t("auth.registerSuccess")}
            </CardTitle>
            <CardDescription className="text-center">
              {registrationStatus === "pending" ? (
                t("auth.processingRegistration")
              ) : (
                <>
                  {t("auth.emailVerificationDesc").replace("{email}", email)}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-gray-500">
              {registrationStatus === "pending" ? 
                t("auth.waitMoment") : 
                t("auth.checkSpam")
              }
            </p>
            {registrationStatus !== "pending" && (
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/login">{t("auth.goToLogin")}</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] py-12">
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 社交登录按钮 */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn("github")}
              disabled={isOAuthLoading !== null}
              className="w-full"
            >
              {isOAuthLoading === "github" ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn("google")}
              disabled={isOAuthLoading !== null}
              className="w-full"
            >
              {isOAuthLoading === "google" ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>
          
          {/* 普通注册表单 */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "注册中..." : t("auth.register")}
              </Button>
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                已有账户?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  {t("auth.login")}
                </Link>
              </p>
              
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {t("auth.agreeToTerms")}{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {t("footer.terms")}
                </Link>{" "}
                {t("auth.and")}{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t("footer.privacy")}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 