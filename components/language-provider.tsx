"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { zhCN, enUS } from "@/lib/translations"

type Language = "zh" | "en"
type Translations = typeof zhCN & {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 从浏览器语言设置获取初始语言
const getInitialLanguage = (): Language => {
  // 检查之前是否已保存语言设置
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage === 'zh' || savedLanguage === 'en') {
      return savedLanguage
    }

    // 如果没有保存的语言，检测浏览器设置
    const browserLang = navigator.language.toLowerCase()
    // 中文优先判断
    if (browserLang.startsWith('zh')) {
      return 'zh'
    }
    // 默认返回英文
    return 'en'
  }
  
  // 服务器端渲染时默认为英文
  return 'en'
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<Language>("en") // 初始值为英文
  const [translations, setTranslations] = useState<Translations>(enUS as Translations) // 初始翻译也设为英文
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化语言设置
  useEffect(() => {
    const initialLang = getInitialLanguage()
    setLanguage(initialLang)
    setIsInitialized(true)
  }, [])

  // 语言变更时的处理
  useEffect(() => {
    if (!isInitialized) return;

    // 设置翻译
    setTranslations(language === "zh" ? (zhCN as Translations) : (enUS as Translations))
    
    // 更新HTML lang属性
    document.documentElement.lang = language
    
    // 保存语言偏好到localStorage
    localStorage.setItem('language', language)
  }, [language, isInitialized])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[key] || key;
    
    // 如果有替换参数，进行替换
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
      });
    }
    
    return text;
  }

  return <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
