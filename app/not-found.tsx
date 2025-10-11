import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileCheck, Home } from 'lucide-react'
import { Suspense } from 'react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-muted p-5 rounded-full">
            <FileCheck className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tighter">404 - 页面未找到</h1>
        
        <p className="text-muted-foreground text-lg">
          您访问的页面不存在，或者已被移动到其他位置。
        </p>
        
        <div className="space-y-2">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 