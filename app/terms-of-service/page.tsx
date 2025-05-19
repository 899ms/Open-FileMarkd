"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsOfService() {
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
      
      <h1 className="text-3xl font-bold mb-6">{language === 'zh' ? '服务条款' : 'Terms of Service'}</h1>
      
      {language === 'zh' ? (
        <>
          <p className="mb-4">最后更新日期：2025年4月1日</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. 接受条款</h2>
          <p className="mb-4">
            欢迎使用PDF2MD服务。通过访问或使用我们的网站、应用程序或服务，您同意受这些服务条款的约束。如果您不同意这些条款，请不要使用我们的服务。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. 服务描述</h2>
          <p className="mb-4">
            PDF2MD提供PDF文件转换为Markdown格式的在线服务。我们的服务可能会不时更改，我们保留修改、暂停或终止服务的权利，恕不另行通知。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. 用户账户</h2>
          <p className="mb-4">
            某些功能可能需要您创建账户。您负责维护您账户的保密性，并对账户下发生的所有活动负责。您同意立即通知我们任何未经授权使用您账户的情况。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. 用户行为</h2>
          <p className="mb-4">
            使用我们的服务时，您同意：
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>遵守所有适用的法律和法规</li>
            <li>不上传包含恶意软件、病毒或有害代码的文件</li>
            <li>不侵犯他人的知识产权或隐私权</li>
            <li>不使用服务进行任何非法活动</li>
            <li>不干扰或破坏服务的正常运行</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. 知识产权</h2>
          <p className="mb-4">
            我们的网站、服务和内容受版权、商标和其他知识产权法保护。您不得复制、修改、分发或创建基于我们服务的衍生作品，除非经我们明确许可。
          </p>
          <p className="mb-4">
            您上传的内容仍然属于您。我们不会声称对您的内容拥有所有权，但您授予我们非排他性许可，以使用、存储和处理您的内容，以提供服务。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. 免责声明</h2>
          <p className="mb-4">
            我们的服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、及时、安全或无错误，也不保证服务将满足您的特定需求。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. 责任限制</h2>
          <p className="mb-4">
            在法律允许的最大范围内，我们对于因使用或无法使用我们的服务而导致的任何直接、间接、附带、特殊、衍生性或惩罚性损害不承担责任。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. 服务变更</h2>
          <p className="mb-4">
            我们保留随时修改、暂停或终止我们的服务或其任何部分的权利，恕不另行通知。我们不会对此类修改、暂停或终止对您或任何第三方造成的任何损失负责。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. 适用法律</h2>
          <p className="mb-4">
            这些条款受中华人民共和国法律管辖并按其解释，不考虑法律冲突原则。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. 条款变更</h2>
          <p className="mb-4">
            我们可能会不时更新这些服务条款。更新后的条款将在网站上公布，继续使用我们的服务即表示您接受修改后的条款。
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. 联系我们</h2>
          <p className="mb-4">
            如果您对这些服务条款有任何疑问，请通过以下方式联系我们：
          </p>
          <p className="mb-4">
            电子邮件：wt@wmcircle.cn
          </p>
        </>
      ) : (
        <>
          <p className="mb-4">Last Updated: April 1, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            Welcome to PDF2MD service. By accessing or using our website, applications, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Service Description</h2>
          <p className="mb-4">
            PDF2MD provides online conversion services for PDF files to Markdown format. Our services may change from time to time, and we reserve the right to modify, suspend, or terminate our services without notice.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            Some features may require you to create an account. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p className="mb-4">
            While using our services, you agree to:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Comply with all applicable laws and regulations</li>
            <li>Not upload files containing malware, viruses, or harmful code</li>
            <li>Not infringe on intellectual property rights or privacy rights of others</li>
            <li>Not use the services for any illegal activities</li>
            <li>Not interfere with or disrupt the normal operation of the services</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p className="mb-4">
            Our website, services, and content are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our services unless explicitly permitted by us.
          </p>
          <p className="mb-4">
            Content you upload remains yours. We do not claim ownership of your content, but you grant us a non-exclusive license to use, store, and process your content to provide our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Disclaimers</h2>
          <p className="mb-4">
            Our services are provided "as is" without any warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, timely, secure, or error-free, or that they will meet your specific requirements.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from the use of or inability to use our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Service Changes</h2>
          <p className="mb-4">
            We reserve the right to modify, suspend, or terminate our services or any part thereof at any time without notice. We shall not be liable for any loss caused to you or any third party by such modification, suspension, or termination.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
          <p className="mb-4">
            These terms shall be governed by and construed in accordance with the laws of the People's Republic of China, without regard to conflict of law principles.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms of Service from time to time. The updated terms will be posted on our website, and your continued use of our services constitutes acceptance of the modified terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="mb-4">
            Email: wt@wmcircle.cn
          </p>
        </>
      )}
    </div>
  )
} 