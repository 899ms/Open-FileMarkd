import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Mistral OCR 模型API配置
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/ocr';
const API_KEY = process.env.MISTRAL_API_KEY || '';

// 定义文件大小限制
const FREE_USER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PREMIUM_USER_MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

// 免费用户每月最大使用次数
const FREE_USER_MONTHLY_LIMIT = 5;

// 初始化 S3 客户端 (Cloudflare R2)
const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// 检查用户使用次数限制
async function checkUserUsageLimit(userId: string) {
  try {
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { canUse: false, error: "用户不存在" };
    }

    // 如果是付费用户，不受限制
    if (user.hasActiveSubscription) {
      return {
        canUse: true,
        usageCount: user.usageCount || 0,
        unlimited: true
      };
    }

    // 检查是否需要重置使用次数
    const now = new Date();
    if (!user.usageResetDate || now >= new Date(user.usageResetDate)) {
      // 将在增加使用次数时重置，这里只检查是否可以使用
      return { 
        canUse: true, 
        usageCount: 0,
        resetDate: now
      };
    }

    // 检查是否达到使用次数限制
    const usageCount = user.usageCount || 0;
    const canUse = usageCount < FREE_USER_MONTHLY_LIMIT;
    
    return {
      canUse,
      usageCount,
      resetDate: user.usageResetDate,
      remainingUses: FREE_USER_MONTHLY_LIMIT - usageCount
    };
  } catch (error) {
    console.error("检查使用次数失败:", error);
    return { canUse: false, error: "检查使用次数失败" };
  }
}

// 增加用户使用次数
async function incrementUserUsage(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error("增加使用次数失败: 用户不存在");
      return;
    }

    // 检查是否需要重置计数（新月份）
    const now = new Date();
    if (!user.usageResetDate || now >= new Date(user.usageResetDate)) {
      // 设置新的重置日期（下个月1日）
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          usageCount: 1,
          usageResetDate: nextMonth
        }
      });
    } else {
      // 只增加计数
      await prisma.user.update({
        where: { id: userId },
        data: {
          usageCount: (user.usageCount || 0) + 1
        }
      });
    }
  } catch (error) {
    console.error("增加使用次数失败:", error);
  }
}

// 将大文件上传到R2存储
async function uploadToR2(file: File, userId: string): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${userId}-${timestamp}.${fileExtension}`;
    
    // 上传到R2
    await R2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
      })
    );
    
    // 返回公开访问URL
    return `${R2_PUBLIC_URL}/${uniqueFileName}`;
  } catch (error) {
    console.error('上传文件到R2失败:', error);
    throw new Error('上传文件到R2失败');
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API调用开始: /api/convert');
    
    if (!API_KEY) {
      console.error('错误: 缺少API密钥配置');
      return NextResponse.json(
        { error: '缺少API密钥配置' },
        { status: 500 }
      );
    }

    // 获取用户会话
    console.log('获取用户会话...');
    const session = await getServerSession(authOptions);
    console.log('会话状态:', session ? '已获取' : '未获取', '用户信息:', session?.user);
    
    // 检查用户是否已登录
    if (!session?.user?.id) {
      console.error('错误: 用户未登录');
      return NextResponse.json(
        { error: '请先登录后再使用此功能' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('用户ID:', userId);
    
    // 解析multipart/form-data请求
    console.log('解析文件上传...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('错误: 未找到上传的文件');
      return NextResponse.json(
        { error: '未找到PDF文件' },
        { status: 400 }
      );
    }

    console.log('文件信息:', { 
      name: file.name, 
      type: file.type, 
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB` 
    });

    // 检查文件类型
    if (file.type !== 'application/pdf' && !file.type.includes('image/')) {
      console.error('错误: 不支持的文件类型:', file.type);
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持PDF和图像文件' },
        { status: 400 }
      );
    }
    
    // 获取用户信息，包括订阅状态
    console.log('获取用户信息...');
    try {
      // 首先尝试直接从会话中获取订阅状态
      const hasSubscriptionFromSession = session.user.hasActiveSubscription === true;
      console.log('会话中的订阅状态:', hasSubscriptionFromSession);
      
      // 从数据库获取用户信息
      console.log('从数据库查询用户信息，ID:', userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          hasActiveSubscription: true
        }
      });
      
      if (!user) {
        console.error('错误: 用户信息获取失败，用户ID不存在:', userId);
        
        // 尝试使用会话中的订阅信息作为备选
        if (session.user.email) {
          console.log('尝试使用邮箱查询用户:', session.user.email);
          const userByEmail = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              hasActiveSubscription: true
            }
          });
          
          if (userByEmail) {
            console.log('通过邮箱找到用户:', userByEmail);
            // 使用通过邮箱找到的用户信息
            const maxFileSize = userByEmail.hasActiveSubscription ? PREMIUM_USER_MAX_FILE_SIZE : FREE_USER_MAX_FILE_SIZE;
            
            // 继续处理...
            return processFile(file, userByEmail.id, userByEmail.hasActiveSubscription, maxFileSize);
          } else {
            console.error('通过邮箱也未找到用户');
          }
        }
        
        // 如果无法通过ID或邮箱找到用户，则使用会话信息作为备选
        console.log('使用会话信息作为备选');
        const maxFileSize = hasSubscriptionFromSession ? PREMIUM_USER_MAX_FILE_SIZE : FREE_USER_MAX_FILE_SIZE;
        
        return processFile(file, userId, hasSubscriptionFromSession, maxFileSize);
      }
      
      console.log('用户信息:', { id: user.id, hasSubscription: user.hasActiveSubscription });
      
      // 先检查用户使用次数限制
      console.log('检查使用次数限制...');
      const canUseResult = await checkUserUsageLimit(userId);
      console.log('使用限制检查结果:', canUseResult);
      
      if (!canUseResult.canUse) {
        console.log('错误: 用户已达到使用限制');
        return NextResponse.json(
          { 
            error: '已达到本月免费使用次数限制',
            limit: FREE_USER_MONTHLY_LIMIT,
            usageCount: canUseResult.usageCount,
            resetDate: canUseResult.resetDate,
            upgradeUrl: '/#pricing',
            remainingUses: 0
          },
          { status: 403 }
        );
      }
      
      // 根据用户订阅状态决定文件大小限制
      const maxFileSize = user.hasActiveSubscription ? PREMIUM_USER_MAX_FILE_SIZE : FREE_USER_MAX_FILE_SIZE;
      
      // 处理文件
      return processFile(file, userId, user.hasActiveSubscription, maxFileSize);
      
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      return NextResponse.json(
        { error: '用户信息获取失败: ' + (dbError instanceof Error ? dbError.message : '数据库错误') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF转换API发生异常:', error);
    return NextResponse.json(
      { error: '服务器内部错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

// 处理文件上传和转换的函数
async function processFile(file: File, userId: string, hasSubscription: boolean, maxFileSize: number) {
  try {
    // 如果文件太大且用户没有订阅，返回错误
    if (file.size > maxFileSize) {
      console.error('错误: 文件大小超过限制', { 
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`, 
        limit: `${maxFileSize / 1024 / 1024}MB`, 
        hasSubscription 
      });
      return NextResponse.json(
        { 
          error: `文件大小超过限制，${hasSubscription ? '订阅用户' : '免费用户'}最大支持${hasSubscription ? '30MB' : '5MB'}`,
          upgradeUrl: '/#pricing'
        },
        { status: 413 }
      );
    }

    let payload;
    let fileUrl;

    // 根据文件大小决定处理方式
    if (file.size > FREE_USER_MAX_FILE_SIZE) {
      // 大文件：上传到R2获取URL
      fileUrl = await uploadToR2(file, userId);
      
      // 使用文件URL构建请求体
      if (file.type === 'application/pdf') {
        payload = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: fileUrl
          }
        };
      } else {
        payload = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: fileUrl
          }
        };
      }
    } else {
      // 小文件：直接使用base64
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      if (file.type === 'application/pdf') {
        payload = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: `data:${file.type};base64,${base64Data}`
          }
        };
      } else {
        payload = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: `data:${file.type};base64,${base64Data}`
          }
        };
      }
    }

    // 调用Mistral OCR API
    console.log('调用OCR API...');
    const response = await axios.post(
      MISTRAL_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        maxBodyLength: Infinity
      }
    );

    // 增加用户使用次数
    console.log('增加用户使用次数...');
    await incrementUserUsage(userId);

    // 获取OCR结果
    const ocrResult = response.data;
    console.log('OCR处理完成');
    
    // 处理OCR结果为Markdown
    // 新版OCR API返回的是多页结果，每页有markdown字段
    const markdownPages = Array.isArray(ocrResult.pages) 
      ? ocrResult.pages.map((page: any) => page.markdown || '').join('\n\n')
      : '';
    
    return NextResponse.json({ markdown: markdownPages });
  } catch (error) {
    console.error('处理文件时出错:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理文件时出错' },
      { status: 500 }
    );
  }
}

/**
 * 将OCR结果格式化为Markdown
 * @param ocrResult OCR API响应结果
 * @returns 格式化后的Markdown文本
 */
function formatToMarkdown(ocrResult: any): string {
  if (!ocrResult || !ocrResult.text) {
    return '';
  }

  let text = ocrResult.text;
  
  // 根据OCR识别结果优化Markdown格式
  // 处理标题
  text = text.replace(/^(.+)$/gm, (match: string, p1: string) => {
    if (p1.length <= 100 && !p1.includes('\n') && p1.trim()) {
      // 判断是否为标题行
      if (/^[A-Z0-9\s]+$/.test(p1.trim()) || p1.trim().endsWith(':')) {
        return `\n## ${p1.trim()}\n`;
      }
    }
    return match;
  });

  // 处理列表项
  text = text.replace(/^[\s\t]*[•·\-\*](.+)$/gm, '* $1');
  text = text.replace(/^[\s\t]*(\d+)[.)](.+)$/gm, '$1.$2');

  // 处理引用
  text = text.replace(/^[\s\t]*>(.+)$/gm, '> $1');

  // 处理斜体和粗体
  text = text.replace(/\*([^*]+)\*/g, '_$1_');
  text = text.replace(/\*\*([^*]+)\*\*/g, '**$1**');

  // 创建段落分隔
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
} 