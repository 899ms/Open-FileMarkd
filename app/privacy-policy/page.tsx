"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
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
      
      <h1 className="text-3xl font-bold mb-6">{language === 'zh' ? '隐私政策' : 'Privacy Policy'}</h1>
      
      {language === 'zh' ? (
        <>
          <p className="mb-4">最后更新日期：2025年4月1日</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. 引言</h2>
          <p className="mb-4">
            欢迎使用我们的PDF转Markdown服务。我们重视您的隐私并致力于保护您的个人信息。本隐私政策旨在向您说明我们如何收集、使用、披露和保护您的信息。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. 信息收集</h2>
          <p className="mb-4">
            我们可能收集以下类型的信息：
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>您提供给我们的信息：当您注册账户、使用我们的服务或与我们联系时，您可能会提供姓名、电子邮件地址等个人信息。</li>
            <li>自动收集的信息：我们可能会自动收集有关您使用我们服务的信息，包括IP地址、设备信息和浏览活动。</li>
            <li>上传的文件信息：当您上传PDF文件进行转换时，我们会临时存储这些文件以完成转换过程。</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. 信息使用</h2>
          <p className="mb-4">
            我们使用收集到的信息：
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>提供、维护和改进我们的服务</li>
            <li>处理您的PDF转换请求</li>
            <li>发送服务通知和更新</li>
            <li>回应您的问询和请求</li>
            <li>分析用户行为，改善用户体验</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. 信息分享</h2>
          <p className="mb-4">
            我们不会出售或出租您的个人信息给第三方。在以下情况下，我们可能会分享您的信息：
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>征得您的同意</li>
            <li>与为我们提供服务的供应商合作</li>
            <li>遵守法律要求</li>
            <li>保护我们的权利和财产</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. 数据安全</h2>
          <p className="mb-4">
            我们采取合理的安全措施保护您的个人信息不被未经授权的访问、使用或披露。然而，没有任何互联网传输或电子存储方法是100%安全的。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. 数据保留</h2>
          <p className="mb-4">
            我们仅在必要时间内保留您的个人信息，以实现本隐私政策中描述的目的。上传进行转换的PDF文件在转换完成后将被删除。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. 您的权利</h2>
          <p className="mb-4">
            根据适用的数据保护法律，您可能拥有以下权利：
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>访问您的个人信息</li>
            <li>更正不准确的数据</li>
            <li>删除您的个人信息</li>
            <li>限制或反对处理您的数据</li>
            <li>数据可携带性</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. 隐私政策更新</h2>
          <p className="mb-4">
            我们可能会不时更新本隐私政策。更新后的政策将在网站上公布，重大变更将通过电子邮件或网站通知告知。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. 联系我们</h2>
          <p className="mb-4">
            如果您对本隐私政策有任何疑问或顾虑，请通过以下方式联系我们：
          </p>
          <p className="mb-4">
            电子邮件：wt@wmcircle.cn
          </p>
        </>
      ) : (
        <>
          <p className="mb-4">Last Updated: April 1, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to our PDF to Markdown conversion service. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Information Collection</h2>
          <p className="mb-4">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Information you provide: When you register for an account, use our services, or contact us, you may provide personal information such as your name and email address.</li>
            <li>Automatically collected information: We may automatically collect information about your use of our services, including IP address, device information, and browsing activity.</li>
            <li>Uploaded file information: When you upload PDF files for conversion, we temporarily store these files to complete the conversion process.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Information Usage</h2>
          <p className="mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your PDF conversion requests</li>
            <li>Send service notifications and updates</li>
            <li>Respond to your inquiries and requests</li>
            <li>Analyze user behavior to improve user experience</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
          <p className="mb-4">
            We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>With your consent</li>
            <li>With service providers who perform services on our behalf</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and property</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission or electronic storage method is 100% secure.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy. PDF files uploaded for conversion are deleted after the conversion is complete.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
          <p className="mb-4">
            Depending on applicable data protection laws, you may have the following rights:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of or objection to the processing of your data</li>
            <li>Data portability</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Privacy Policy Updates</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. The updated policy will be posted on our website, and significant changes will be communicated via email or website notification.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p className="mb-4">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-4">
            Email: wt@wmcircle.cn
          </p>
        </>
      )}
    </div>
  )
} 