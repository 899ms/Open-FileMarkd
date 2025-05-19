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
import { ChevronLeft, Github, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const { t } = useLanguage()
  const { login, socialLogin, loading } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  })

  // 验证表单
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      email: "",
      password: ""
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

    setErrors(newErrors)
    return isValid
  }

  // 处理登录提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const success = await login(email, password)
    if (success) {
      router.push("/")
    }
  }

  // 社交登录处理
  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      setIsOAuthLoading(provider)
      await socialLogin(provider)
    } catch (error) {
      console.error(`${provider} 登录失败:`, error)
    } finally {
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
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
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isOAuthLoading !== null}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("auth.login")}...
                  </span>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {t("auth.signIn")}
                  </>
                )}
              </Button>
              
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {t("auth.loginAgreeToTerms")}{" "}
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
        
        <CardFooter>
          <p className="text-center text-sm w-full">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("auth.createAccount")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 