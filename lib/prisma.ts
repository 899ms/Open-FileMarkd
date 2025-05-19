import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 使用单例模式，确保在开发环境下热重载时不会创建多个PrismaClient实例
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// 在非生产环境中，将prisma附加到全局对象以防止多次实例化
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} 