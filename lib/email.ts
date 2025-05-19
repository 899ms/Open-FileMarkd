// 使用动态导入避免构建时错误
let resend: any = null;
let resendPromise: Promise<any> | null = null;

// 默认使用Resend API，如果密钥不存在则模拟发送
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';

// 初始化Resend客户端
async function getResendClient() {
  if (!RESEND_API_KEY) {
    return null;
  }
  
  if (!resend && !resendPromise) {
    resendPromise = import('resend').then(module => {
      const Resend = module.Resend;
      resend = new Resend(RESEND_API_KEY);
      return resend;
    }).catch(error => {
      console.error('无法加载Resend:', error);
      return null;
    });
  }
  
  if (!resend && resendPromise) {
    resend = await resendPromise;
  }
  
  return resend;
}

/**
 * 发送邮箱验证邮件
 * @param email 用户邮箱
 * @param name 用户名
 * @param token 验证令牌
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  console.log(`尝试发送验证邮件到: ${email}, 令牌: ${token.substring(0, 5)}...`);
  
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  // 获取Resend客户端
  const resendClient = await getResendClient();
  
  // 如果没有配置Resend API密钥，模拟发送
  if (!resendClient) {
    console.log('没有配置Resend API密钥，模拟发送邮件');
    console.log('验证链接:', verificationUrl);
    return { id: 'mock-email-id' };
  }
  
  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: '请验证您的邮箱地址',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">验证您的邮箱</h1>
          <p>您好，${name}：</p>
          <p>感谢您注册我们的服务。请点击下面的链接验证您的邮箱地址：</p>
          <p style="margin: 20px 0;">
            <a 
              href="${verificationUrl}" 
              style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
            >
              验证邮箱
            </a>
          </p>
          <p>或者复制以下链接到浏览器中：</p>
          <p>${verificationUrl}</p>
          <p>此链接将在24小时后过期。</p>
          <p>如果您没有注册账户，请忽略此邮件。</p>
          <p>谢谢！</p>
        </div>
      `
    });

    if (error) {
      console.error('发送邮件失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.log('邮件发送成功，ID:', data?.id);
    return data;
  } catch (err) {
    console.error('发送邮件时出现异常:', err);
    throw err;
  }
}

/**
 * 发送密码重置邮件
 * @param email 用户邮箱
 * @param name 用户名
 * @param token 重置令牌
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  console.log(`尝试发送密码重置邮件到: ${email}, 令牌: ${token.substring(0, 5)}...`);
  
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  // 获取Resend客户端
  const resendClient = await getResendClient();
  
  // 如果没有配置Resend API密钥，模拟发送
  if (!resendClient) {
    console.log('没有配置Resend API密钥，模拟发送邮件');
    console.log('重置链接:', resetUrl);
    return { id: 'mock-email-id' };
  }
  
  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: '重置您的密码',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">重置您的密码</h1>
          <p>您好，${name}：</p>
          <p>您收到此邮件是因为您（或其他人）请求重置您账户的密码。</p>
          <p>请点击下面的链接重置密码：</p>
          <p style="margin: 20px 0;">
            <a 
              href="${resetUrl}" 
              style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
            >
              重置密码
            </a>
          </p>
          <p>或者复制以下链接到浏览器中：</p>
          <p>${resetUrl}</p>
          <p>此链接将在1小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件，您的密码将保持不变。</p>
          <p>谢谢！</p>
        </div>
      `
    });

    if (error) {
      console.error('发送密码重置邮件失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.log('密码重置邮件发送成功，ID:', data?.id);
    return data;
  } catch (err) {
    console.error('发送密码重置邮件时出现异常:', err);
    throw err;
  }
}

/**
 * 生成随机验证令牌
 * @returns 随机字符串令牌
 */
export function generateVerificationToken(): string {
  // 生成32位随机字符串
  return Buffer.from(Math.random().toString(36) + Date.now().toString(36))
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 32);
} 