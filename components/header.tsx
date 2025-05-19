"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Moon, Sun, Languages, Menu, X, User } from "lucide-react"

export function Header() {
  const { setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 获取用户头像的首字母
  const getUserInitials = () => {
    if (!user || !user.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/logo.png"
            alt="PDF2MD Logo"
            width={40}
            height={25}
            className="h-auto w-auto object-contain"
            style={{ maxHeight: '32px' }}
          />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 text-lg font-extrabold relative group">
            PDF2MD
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            <span className="absolute -right-1 top-0 h-0 w-0.5 bg-primary group-hover:h-full transition-all duration-300 delay-100"></span>
            <span className="absolute -top-1 right-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 delay-200"></span>
            <span className="absolute -left-1 bottom-0 h-0 w-0.5 bg-primary group-hover:h-full transition-all duration-300 delay-300"></span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-base font-medium text-primary hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
            {t("nav.home")}
          </Link>
          <Link href="/#features" className="text-base font-medium text-primary hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
            {t("nav.features")}
          </Link>
          <Link href="/#converter" className="text-base font-medium text-primary hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
            {t("nav.converter")}
          </Link>
          <Link href="/#pricing" className="text-base font-medium text-primary hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
            {t("nav.pricing")}
          </Link>
          <Link href="/#faq" className="text-base font-medium text-primary hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
            {t("nav.faq")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Languages className="h-4 w-4" />
                <span className="sr-only">{t("common.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("zh")} className="text-base">中文</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className="text-base">English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t("common.theme")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")} className="text-base">{t("common.light")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="text-base">{t("common.dark")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户认证按钮/用户头像 - 桌面端 */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-base">{user?.name}</DropdownMenuItem>
                  <DropdownMenuItem className="text-base">{user?.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-base">
                    <Link href="/profile">{t("auth.userProfile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-base">{t("auth.logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-base">
                  <Link href="/login">{t("auth.login")}</Link>
                </Button>
                <Button asChild className="text-base">
                  <Link href="/register">{t("auth.register")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - 回到简单的条件渲染 */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[4.5rem] z-50 bg-background/100 border-t shadow-lg md:hidden">
          <div className="container py-6 bg-white dark:bg-gray-950">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-lg font-medium text-primary px-2 py-2 rounded hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/#features"
                className="text-lg font-medium text-primary px-2 py-2 rounded hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.features")}
              </Link>
              <Link
                href="/#converter"
                className="text-lg font-medium text-primary px-2 py-2 rounded hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.converter")}
              </Link>
              <Link
                href="/#pricing"
                className="text-lg font-medium text-primary px-2 py-2 rounded hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                href="/#faq"
                className="text-lg font-medium text-primary px-2 py-2 rounded hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.faq")}
              </Link>
              
              {/* 移动端登录/注册按钮 */}
              {!isAuthenticated && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                  <Button variant="outline" asChild className="justify-start text-base h-12 bg-white dark:bg-gray-800">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      {t("auth.login")}
                    </Link>
                  </Button>
                  <Button asChild className="justify-start text-base h-12">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      {t("auth.register")}
                    </Link>
                  </Button>
                </div>
              )}
              
              {/* 移动端用户菜单 */}
              {isAuthenticated && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-3 px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900 dark:text-white">{user?.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="justify-start text-base h-12 bg-white dark:bg-gray-800">
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      {t("auth.userProfile")}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start text-base h-12 text-red-500 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/20"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                  >
                    {t("auth.logout")}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
