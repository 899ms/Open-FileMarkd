"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function FAQ() {
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
      
      <h1 className="text-3xl font-bold mb-6">{t("faq.title")}</h1>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">{t("faq.q1")}</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {t("faq.a1")}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">{t("faq.q2")}</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {t("faq.a2")}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">{t("faq.q3")}</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {t("faq.a3")}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">{t("faq.q4")}</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {t("faq.a4")}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">{t("faq.q5")}</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {t("faq.a5")}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-6" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">
            {language === 'zh' ? '如何获取最佳转换效果？' : 'How to get the best conversion results?'}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {language === 'zh' 
              ? '为了获得最佳效果，请确保上传的PDF文件具有清晰的文本内容。扫描的文档建议使用高分辨率扫描以提高OCR识别准确率。'
              : 'For best results, ensure your PDF files have clear text content. For scanned documents, high-resolution scans are recommended to improve OCR recognition accuracy.'}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-7" className="border rounded-md p-2">
          <AccordionTrigger className="text-lg font-medium p-2">
            {language === 'zh' ? 'Mistral OCR是什么？' : 'What is Mistral OCR?'}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {language === 'zh' 
              ? 'Mistral OCR-2503是Mistral AI开发的先进光学字符识别模型，它能够高精度识别文档中的文本内容并理解文档结构，为我们的PDF转Markdown服务提供了强大的支持。'
              : 'Mistral OCR-2503 is an advanced optical character recognition model developed by Mistral AI. It can recognize text in documents with high precision and understand document structure, providing powerful support for our PDF to Markdown service.'}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
} 