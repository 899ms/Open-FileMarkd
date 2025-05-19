"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageSquare, Twitter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactUs() {
  const { t, language } = useLanguage()
  
  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="pl-0 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {language === 'zh' ? '返回首页' : 'Back to Home'}
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">{language === 'zh' ? '联系我们' : 'Contact Us'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {language === 'zh' ? '电子邮件' : 'Email'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              <a href="mailto:wt@wmcircle.cn" className="hover:underline">
                wt@wmcircle.cn
              </a>
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {language === 'zh' ? '微信' : 'WeChat'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {language === 'zh' ? '微信号: zyailive01' : 'WeChat ID: zyailive01'}
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-primary" />
              {language === 'zh' ? '推特' : 'Twitter'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              <a href="https://twitter.com/zyailive" target="_blank" rel="noopener noreferrer" className="hover:underline">
                @zyailive
              </a>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 text-center text-muted-foreground">
        <p>
          {language === 'zh' 
            ? '我们会在工作时间尽快回复您的消息。感谢您的耐心等待！' 
            : 'We will respond to your messages during business hours. Thank you for your patience!'}
        </p>
      </div>
    </div>
  )
} 