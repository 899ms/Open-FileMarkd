import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function EmailVerifiedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          邮箱验证成功！
        </h1>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          您的邮箱已成功验证。现在您可以使用完整的账户功能。
        </p>
        <div className="flex justify-center">
          <Button asChild className="px-6">
            <Link href="/login">前往登录</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 