import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // 从URL获取验证令牌
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "缺少验证令牌" },
        { status: 400 }
      )
    }

    // 查找具有此令牌的用户
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
        { error: "无效或已过期的验证令牌" },
        { status: 400 }
      )
    }

    // 更新用户为已验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null
      }
    })

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: "邮箱验证成功"
    })
  } catch (error) {
    console.error("邮箱验证失败:", error)
    return NextResponse.json(
      { error: "验证过程中出现错误" },
      { status: 500 }
    )
  }
} 