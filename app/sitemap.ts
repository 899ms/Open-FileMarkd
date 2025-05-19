import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdf2md.site'
  const lastModified = new Date()
  
  // 核心页面 - 高优先级
  const coreRoutes = [
    { url: '', priority: 1.0 },   // 首页
  ]
  
  // 重要的支持页面
  const importantRoutes = [
    { url: '/faq', priority: 0.8 },      // 常见问题
    { url: '/login', priority: 0.7 },    // 登录
    { url: '/register', priority: 0.7 }, // 注册
    { url: '/profile', priority: 0.6 },  // 个人资料
  ]
  
  // 辅助页面 - 较低优先级
  const supportRoutes = [
    { url: '/contact-us', priority: 0.5 },       // 联系我们
    { url: '/terms-of-service', priority: 0.4 }, // 服务条款
    { url: '/privacy-policy', priority: 0.4 },   // 隐私政策
    { url: '/forgot-password', priority: 0.3 },  // 忘记密码
  ]
  
  // 合并所有路由
  const allRoutes = [...coreRoutes, ...importantRoutes, ...supportRoutes]
  
  // 转换为Sitemap格式
  const routes = allRoutes.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.priority > 0.7 ? 'daily' as const : 'weekly' as const,
    priority: route.priority,
  }))
  
  // 添加语言路由
  const locales = ['en', 'zh']
  const localizedRoutes = locales.flatMap(locale => 
    allRoutes.map(route => ({
      url: `${baseUrl}/${locale}${route.url}`,
      lastModified,
      changeFrequency: route.priority > 0.7 ? 'daily' as const : 'weekly' as const,
      priority: route.priority * 0.9, // 语言特定版本略低优先级
    }))
  )
  
  return [...routes, ...localizedRoutes]
} 