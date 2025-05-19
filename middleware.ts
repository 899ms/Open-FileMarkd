import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 需要保护的路径
const protectedPaths = ['/api/convert']

// 需要自动同步的路径
const syncPaths = ['/', '/profile', '/api/convert'] 

export async function middleware(request: NextRequest) {
  // 获取token
  const token = await getToken({ req: request })
  
  // 如果访问的是需要保护的路径，但用户未登录，则重定向到登录页面
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }
  
  // 如果用户已登录且访问需要同步的路径，异步调用check-usage-limit API完成自动同步
  // 注意：我们不等待API响应，所以不会阻塞页面加载
  if (token && syncPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname === path + '/')) {
    try {
      // 仅在25%的情况下执行同步，避免频繁API调用
      if (Math.random() < 0.25) {
        fetch(new URL('/api/check-usage-limit', request.url), {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        }).catch(error => {
          console.error('Background sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error in middleware sync:', error);
    }
  }
  
  return NextResponse.next()
}

// 配置中间件应该应用于哪些路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - 静态文件(/_next/static/，/favicon.ico等)
     * - 内部Next.js请求(/_next/...)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 