import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateVerificationToken, sendPasswordResetEmail } from "@/lib/email"

// 定义忘记密码表单验证schema
const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的电子邮件地址"),
})

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json()
    
    // 验证输入数据
    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email } = validationResult.data
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    // 为了安全起见，即使用户不存在也返回成功
    // 这样不会泄露有关用户存在与否的信息
    if (!user) {
      return NextResponse.json({
        message: "如果您的邮箱在我们的系统中，您将收到重置密码的邮件"
      })
    }
    
    // 生成重置令牌与过期时间（1小时后）
    const resetToken = generateVerificationToken()
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1小时后
    
    // 更新用户记录添加重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        verificationTokenExpires: resetTokenExpires,
      },
    })
    
    // 发送重置密码邮件
    try {
      await sendPasswordResetEmail(email, user.name, resetToken)
    } catch (emailError) {
      console.error('发送重置密码邮件失败:', emailError)
      // 即使邮件发送失败，我们仍然返回成功以不泄露信息
    }
    
    return NextResponse.json({
      message: "如果您的邮箱在我们的系统中，您将收到重置密码的邮件"
    })
    
  } catch (error) {
    console.error("忘记密码处理失败:", error)
    return NextResponse.json(
      { error: "处理请求时出现错误" },
      { status: 500 }
    )
  }
} 