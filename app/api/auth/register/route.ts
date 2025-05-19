import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email"

// 定义注册表单验证schema
const registerSchema = z.object({
  name: z.string().min(1, "姓名是必填项"),
  email: z.string().email("请输入有效的电子邮件地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json()
    
    // 验证输入数据
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validationResult.data
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "此邮箱已被注册" },
        { status: 400 }
      )
    }
    
    // 哈希处理密码
    const hashedPassword = await hash(password, 12)

    // 生成验证令牌与过期时间（24小时后）
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后
    
    // 创建新用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
      },
    })
    
    // 发送验证邮件
    try {
      await sendVerificationEmail(email, name, verificationToken)
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError)
      // 即使邮件发送失败，我们仍然创建用户但记录错误
    }
    
    // 返回用户信息（不包含密码和验证信息）
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      message: "注册成功，请查收验证邮件",
    })
    
  } catch (error) {
    console.error("注册失败:", error)
    return NextResponse.json(
      { error: "注册过程中出现错误" },
      { status: 500 }
    )
  }
} 