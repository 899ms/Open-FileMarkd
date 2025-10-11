# PDF2MD: PDF到Markdown转换工具

PDF2MD是一个高效的PDF到Markdown转换工具，旨在帮助用户轻松将PDF文档转换为Markdown格式，便于编辑、分享和发布。通过简洁易用的界面和强大的转换功能，PDF2MD成为内容创作者、研究人员和开发者的得力助手。

## 特性

- **简单直观的界面**：拖放或点击上传PDF文件，一键转换为Markdown
- **高质量转换**：保留原文档的文本、格式和结构
- **支持多语言**：中英文双语界面支持
- **用户认证系统**：基于NextAuth的完整用户注册/登录功能
- **订阅支付系统**：集成Stripe支付，支持月度和年度订阅计划
- **文件大小限制**：
  - 免费用户：最大5MB的PDF文件
  - 订阅用户：最大30MB的PDF文件
- **响应式设计**：在任何设备上都能获得最佳体验

## 技术栈

- **前端框架**：Next.js 15+，React 18+
- **样式**：TailwindCSS，Radix UI组件库
- **数据库**：Prisma ORM
- **认证**：NextAuth
- **支付处理**：Stripe API
- **多语言支持**：自定义本地化

## 安装与设置

### 前提条件

- Node.js 18+ 
- npm/pnpm

### 安装步骤

1. 克隆仓库:
```bash
git clone <仓库URL>
cd pdf2md
```

2. 安装依赖:
```bash
npm install
# 或
pnpm install
```

3. 设置环境变量:
复制`.env.example`文件到`.env.local`并填写必要的环境变量:
```
# 数据库配置
DATABASE_URL="postgresql://..."

# NextAuth配置
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe配置
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

4. 初始化数据库:
```bash
npx prisma db push
```

5. 启动开发服务器:
```bash
npm run dev
# 或
pnpm dev
```

## 用户指南

### 转换PDF到Markdown

1. 访问首页或转换器页面
2. 拖放PDF文件或点击上传按钮选择文件
3. 点击"转换"按钮
4. 转换完成后，可以预览并下载Markdown文件

### 订阅管理

1. 登录账户后，可以在"价格"部分选择订阅计划
2. 支持月度和年度两种计划选项
3. 使用Stripe安全支付系统完成订阅
4. 在个人资料页面可以查看订阅状态

## 订阅特性

### 免费用户
- 最大文件大小限制：5MB
- 基本转换功能

### 订阅用户
- 最大文件大小限制：30MB
- 无限次转换
- 优先支持服务

## 注意事项

- 订阅机制设计为不可叠加，新订阅只能在当前订阅到期后购买
- 年度订阅提供更多优惠
- 确保上传的PDF文件不含敏感信息

## 开发者信息

### 项目结构

- `app/`: Next.js应用路由和页面
- `components/`: React组件
- `lib/`: 工具函数和服务
- `prisma/`: 数据库模型和迁移
- `public/`: 静态资源
- `styles/`: 全局样式

### API路由

- `/api/auth/*`: NextAuth认证API
- `/api/create-checkout-session`: Stripe结账会话创建
- `/api/check-subscription`: 检查用户订阅状态
- `/api/webhook/stripe`: Stripe webhook处理
- `/api/convert`: PDF转换API

## 贡献

欢迎提交PR和Issue，一起改进这个项目！

## 许可证

[MIT] 
