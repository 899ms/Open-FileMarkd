/**
 * Stripe设置脚本
 * 用于创建和配置产品和价格计划
 * 
 * 使用方法:
 * 1. 确保已安装stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. 登录stripe: stripe login
 * 3. 运行脚本: node scripts/setup-stripe.js
 */

// 注意：此脚本需要在实际配置前添加实现代码
// 以下是示例代码：

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  console.log('正在设置Stripe产品和价格...');
  
  try {
    // 创建产品
    const product = await stripe.products.create({
      name: 'PDF to Markdown Premium',
      description: 'Premium features including batch conversion, larger file size, and priority support',
    });
    
    console.log(`创建产品: ${product.id}`);
    
    // 创建月度价格
    const monthlyPrice = await stripe.prices.create({
      unit_amount: 499, // $4.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: product.id,
      metadata: {
        type: 'monthly',
      },
    });
    
    console.log(`创建月度价格: ${monthlyPrice.id}`);
    
    // 创建年度价格
    const yearlyPrice = await stripe.prices.create({
      unit_amount: 4990, // $49.90
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      product: product.id,
      metadata: {
        type: 'yearly',
      },
    });
    
    console.log(`创建年度价格: ${yearlyPrice.id}`);
    
    // 配置Webhook
    console.log('');
    console.log('请更新.env.local文件添加以下内容:');
    console.log(`NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    
    console.log('');
    console.log('接下来请运行以下命令设置Webhook:');
    console.log('stripe listen --forward-to http://localhost:3000/api/webhook/stripe');
    
    console.log('');
    console.log('复制生成的webhook signing secret并添加到.env.local:');
    console.log('STRIPE_WEBHOOK_SECRET=whsec_xyz123...');
    
  } catch (error) {
    console.error('设置Stripe产品时出错:', error);
  }
}

createProducts(); 