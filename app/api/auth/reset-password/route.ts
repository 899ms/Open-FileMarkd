import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// 定义重置密码表单验证schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, "令牌是必填项"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json()
    
    // 验证输入数据
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { token, password } = validationResult.data
    
    // 查找有效的重置令牌
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date() // 确保令牌未过期
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "无效或已过期的重置令牌" },
        { status: 400 }
      )
    }
    
    // 哈希处理新密码
    const hashedPassword = await hash(password, 12)
    
    // 更新用户密码并清除令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpires: null
      }
    })
    
    return NextResponse.json({
      message: "密码重置成功，请使用新密码登录"
    })
    
  } catch (error) {
    console.error("重置密码失败:", error)
    return NextResponse.json(
      { error: "重置密码过程中出现错误" },
      { status: 500 }
    )
  }
} 