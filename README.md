# FileMarkd

<div align="center">

![FileMarkd Logo](public/logo.png)

**📄 AI 驱动的文档转 Markdown 工具** · **PDF / 图片 / Word 秒变干净 Markdown。**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)

[🌟 在线演示](https://filemarkd.com) · [🚀 快速开始](#-快速开始--quick-start) · [📦 项目结构](#-项目结构--project-structure)

</div>

---

> **PDF、图片、文档，AI 一键转 Markdown。** Convert PDFs, images and documents to clean Markdown with AI.

FileMarkd 是一个 AI 驱动的文档转 Markdown 工具，支持 **PDF / Word / PowerPoint / Excel / 图片 / EPUB / LaTeX / Jupyter / HTML / RTF / ODT / CSV / XML** 等格式输入。AI 自动识别文字、表格、公式与文档层级结构，搭配置信度评分、表格结构还原与智能页眉页脚剥离。配套 Stripe 订阅 / 积分、推广返利、推荐奖励、五语国际化与 SEO、邮件营销、沉睡用户召回与完善的管理员后台，可一键部署到 Vercel。线上演示 → **[filemarkd.com](https://filemarkd.com)**

## ✨ 核心功能 | Core Features

### 📄 多格式文档转 Markdown（Mistral OCR 驱动）
- 支持 **40+ 输入格式**：PDF、Word（.docx/.doc）、PowerPoint（.pptx/.ppt）、Excel（.xlsx/.xls）、CSV、EPUB、LaTeX（.tex）、Jupyter Notebook（.ipynb）、HTML、RTF、ODT、XML；图片（PNG/JPG/WebP/HEIC/TIFF/AVIF/GIF/BMP）
- 默认走 **Mistral OCR `mistral-ocr-latest`**，未配置 `MISTRAL_API_KEY` 或开启 `MISTRAL_OCR_MOCK=true` 时自动回退到确定性的模拟输出，演示与本地开发零成本
- 高级表格格式化：保留表头、合并单元格、对齐方式
- **每个识别块附带 confidence**，便于人工复核低置信度区域
- 智能页眉 / 页脚 / 元数据自动剥离
- 多语言 OCR：内置多语种识别，适合论文、合同、发票、扫描件

### 🔌 三种导入路径
- **本地文件**：拖放 / 点选 → `POST /api/upload` 上传 Cloudflare R2 → `POST /api/convert` 调 Mistral OCR
- **远程 URL**：在首页 URL 输入框直接粘贴公网可访问的 PDF/图片链接；服务端 `probeRemoteUrl` 做协议 / SSRF / 格式 / 大小四重校验后透传 `document_url` 给 Mistral
- **预设示例**：三个内置示例文档（纯前端 mock，**无需登录**即可体验完整 UI）

### 🔐 完整的用户认证系统
- 邮箱密码登录 + 邮箱验证 + 密码重置（Resend 投递）
- Google / GitHub OAuth 自动绑定账户
- NextAuth.js + JWT 会话管理，支持关联账号查询
- 真实路径（文件上传、URL 导入）由前端 `requireAuth()` 守卫拦截，未登录直接 toast 提示，不弹系统选择器；后端 API 兜底 `401 unauthorized`

### 💳 Stripe 支付与积分系统
- 订阅计费：Trial / Pro / Enterprise（实际字段值 `pro` / `enterprise`，分别对应月度与年度）
- 积分购买：Stripe Checkout 一次性付款，Webhook 自动入账
- 客户门户：自助管理订阅、发票、退款
- **积分消耗**：每处理 1 页扣 1 积分（`POINTS_PER_PAGE = 1`），OCR 前后两次校验（预检扣预计页数 → 实际按 `usage_info.pages_processed` 终扣）
- **优先扣赠送，再扣购买**：订阅赠送积分到期清零（`subscription_expired`），购买积分永不过期
- `lib/points-manager.ts` 统一消费、清零、流水

### 🌐 多语言与 SEO
- 内置 **5 语**：英语（默认）、简体中文（zh-CN）、繁体中文（zh-TW）、日语（ja）、韩语（ko）
- **不基于 Accept-Language / IP 自动重定向** —— 根路径 `/` 永远是英文；其他语言走 `/zh-CN/...`、`/ja/...` 等前缀路径；`localeDetection: false`，用户必须主动点击切换器
- 完整 i18n 元数据、hreflang、`sitemap.xml`、JSON-LD（Organization / Product）
- Open Graph 与 Twitter Card 分享预览
- 语言标识采用 BCP47 标准（`zh-CN` / `zh-TW`），历史数据已通过 `0010_locale_bcp47_normalization.sql` 迁移把 `zh` / `tw` 归一化

### 📣 推广返利（Affiliate）
- 用户生成 8 位专属推广码（可自定义一次）
- **首单 30% 佣金**（`orderAmount * 0.3`，单位 cents），写入 `affiliate_earnings` 后冻结 7 天
- **冻结 / 释放 / 取消三态**：FROZEN → 到期解冻为 RELEASED；退款回滚为 CANCELLED
- 推广关系 30 天有效期，过期失效
- 提现最低 **$10**（1000 cents），支持支付宝 / PayPal 账户

### 🎁 推荐奖励（Referral）
- 注册时通过 `?ref=CODE` 绑定推荐关系
- 双方奖励积分 + 订阅天数延长
- 推荐码可自定义一次，防滥用过期

### 🛡️ 管理后台（9 大模块）
侧边栏菜单切换，支持 URL hash 直链（`#overview` `#users` `#newsletter` `#referral` `#affiliate` `#traffic` `#reminders` `#reengagement` `#reengagement-campaigns`）：

1. **概览** — 用户 / 订阅 / 积分 / 推荐 / 返利收入卡片 + 7/30/90 天趋势图
2. **用户** — 积分调整、订阅管理、推送审核、单个用户详情
3. **邮件订阅** — Newsletter 列表、统计、退订
4. **推荐** — 推荐关系 / 奖励流水（`records` / `rewards` 两个 Tab）
5. **推广返利** — 推广人 / 关系 / 佣金 / 提现 4 个 Tab，支持提现审核
6. **流量** — Umami Analytics 集成，实时查看站点流量
7. **提醒日志** — 订阅到期邮件发送记录（类型 / 时间 / 语言 / 计划 / 主题）
8. **沉睡用户** — 5 段分桶统计 + 多维筛选
9. **沉睡召回活动** — 批量邮件活动管理

### 📧 邮件与营销（Resend）
- 验证、重置、支付成功、订阅确认模板
- Newsletter 底部订阅入口，自动同步到 `newsletter_subscriptions` 表
- 退订流程 `/newsletter/unsubscribe`

### 📅 订阅到期提醒（Vercel Cron）
- `vercel.json` 配置每天 13:00 触发 `/api/cron/expire-subscriptions`
- 提前 **7 天 / 3 天 / 当天** 各发一封邮件
- 用户可一键关闭全部提醒（`subscriptionReminderDisabled`），每封邮件含独立退订链接
- 支持中 / 英 / 日 / 韩 / 繁五语邮件偏好（`preferredLanguage`）

### 🛌 沉睡用户召回（Re-engagement）
- **5 段分桶**（`lib/reengagement-buckets.ts`）：`active (<7d)` → `warm [7,30d)` → `dormant [31,90d)` → `inactive [91,180d)` → `churned ≥181d`，外加 `sleeping_paid`
- **多维筛选**：分桶 / 语言 / 订阅状态（从未 / 当前 / 历史）/ 注册渠道 / 关键字搜索 + 多种排序
- **批量召回活动**：基于分桶 + 筛选条件构建目标人群，预览实际可发送数量，自动排除邮箱未验证、当前有效订阅、黑名单用户；分批节流发送
- **黑名单机制**：单 campaign 内已发过同类邮件 / 全局退订 / 历史硬退的用户自动跳过
- 数据表：`reengagement_campaigns`、`reengagement_logs`、`reengagement_excluded_users`

### 🛡️ 安全与稳定性
- `bcryptjs` 加盐哈希密码
- `zod` 校验所有 API 输入
- 角色权限（`user` / `admin`），管理员路由受 `requireAdmin()` 守卫
- **SSRF 防护**：URL 导入拒绝私网 / loopback / IPv6 ULA / link-local / cloud metadata 等地址
- Stripe Webhook 验签
- 敏感配置仅走 `.env.local`

## 🛠️ 技术栈 | Tech Stack

| 层 | 技术 |
|---|---|
| 前端框架 | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| 样式 | Tailwind CSS 3 · Radix UI · shadcn/ui 风格组件库 |
| 表单 | React Hook Form · Zod · `react-icons` |
| 国际化 | `next-intl` · `messages/{en,zh-CN,ja,ko,zh-TW}.json` |
| 后端 | Next.js API Routes · Server Actions |
| 数据库 | PostgreSQL · Drizzle ORM · `drizzle-kit` 迁移（15 份历史迁移） |
| 认证 | NextAuth.js v4 · `@auth/drizzle-adapter`（JWT 会话） |
| 支付 | Stripe (`@stripe/stripe-js` + `stripe`) · Checkout · Customer Portal · Webhook |
| 邮件 | Resend |
| OCR | Mistral OCR `mistral-ocr-latest`（支持 mock 模式） |
| 对象存储 | Cloudflare R2（`@aws-sdk/client-s3`） |
| 图表 | Recharts |
| 部署 | Vercel · Railway · Netlify |

## 🚀 快速开始 | Quick Start

### 📋 环境要求
- Node.js 18+（推荐 20 LTS）
- PostgreSQL 14+（推荐 Neon Serverless / Supabase）
- Stripe 账户（订阅 + 积分都需要）
- Resend 账户（邮件投递）
- Cloudflare R2 桶（文件存储，可选但推荐）
- Google / GitHub OAuth 应用（可选）

### 1. 克隆项目
```bash
git clone https://github.com/ItusiAI/Open-FileMarkd.git
cd FileMarkd
```

### 2. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 3. 环境配置

新建 `.env.local`，填写：

```dotenv
# 数据库
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32>"

# Resend 邮件
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="Your Brand <noreply@yourdomain.com>"
RESEND_BRAND_NAME="Your Brand"
RESEND_ADMIN_EMAIL="admin@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# Stripe 价格 ID（订阅 + 积分包各一份）
STRIPE_TRIAL_PRICE_ID="price_xxxxxxxxxxxxxxxxxx"          # Trial: 一次性 $2.99 / 200 积分
STRIPE_PRO_PRICE_ID="price_xxxxxxxxxxxxxxxxxx"            # Pro Monthly: $14.99 / 月 / 1500 积分
STRIPE_ANNUAL_PRICE_ID="price_xxxxxxxxxxxxxxxxxx"         # Annual: $99 / 年 / 12000 积分
STRIPE_POINTS_STARTER_PRICE_ID="price_xxxxxxxxxxxxxxxxxx" # Starter: 500 积分 / $5
STRIPE_POINTS_POPULAR_PRICE_ID="price_xxxxxxxxxxxxxxxxxx" # Popular: 1500 积分 / $15
STRIPE_POINTS_PREMIUM_PRICE_ID="price_xxxxxxxxxxxxxxxxxx" # Premium: 12000 积分 / $100

# OAuth
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"
GITHUB_ID="<your-github-id>"
GITHUB_SECRET="<your-github-secret>"

# 站点 URL（Sitemap、hreflang、Canonical URL 必须填）
NEXT_PUBLIC_BASE_URL="https://filemarkd.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mistral OCR（可选）
# 未配置 MISTRAL_API_KEY 时 /api/convert 会自动回退到确定性的 mock 输出
MISTRAL_API_KEY="<mistral-api-key>"
MISTRAL_OCR_MODEL="mistral-ocr-latest"
# 显式开启 mock 模式（本地开发 / 演示推荐）
MISTRAL_OCR_MOCK="true"

# Cloudflare R2（服务端上传接口）
R2_ACCOUNT_ID="<cloudflare-account-id>"
R2_ACCESS_KEY_ID="<r2-access-key-id>"
R2_SECRET_ACCESS_KEY="<r2-secret-access-key>"
R2_BUCKET_NAME="<r2-bucket-name>"
# 可选：R2 bucket 的公开域名（如 https://files.example.com），用于让 Mistral 直接 fetch
R2_PUBLIC_URL="<optional-public-base-url>"

# Umami 流量分析（管理员后台使用，可选）
NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-website-id"
NEXT_PUBLIC_UMAMI_SCRIPT_URL="https://cloud.umami.is/script.js"
UMAMI_API_URL="https://cloud.umami.is/api"
UMAMI_API_KEY="your-api-key"
# 自部署 Umami 可选用户名密码
# UMAMI_USERNAME="admin"
# UMAMI_PASSWORD="your-password"

# Cron 提醒（可选，Vercel Cron Job 调用）
CRON_SECRET="<openssl rand -base64 32>"
```

### 4. 数据库初始化
```bash
# 推 schema 到数据库（开发环境）
npm run db:push

# 或生成迁移文件后执行（生产环境推荐）
npm run db:generate
npm run db:migrate

# 打开 Drizzle Studio 可视化管理
npm run db:studio
```

### 5. 提升第一个管理员
启动 dev server 后调用 API 把目标邮箱设为管理员：

```bash
curl -X POST "http://localhost:3000/api/admin/set-admin" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourdomain.com"}'
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000`，使用管理员账号登录后访问 `http://localhost:3000/zh-CN/admin` 进入管理后台（侧边栏切换模块，或直接 `#users` / `#affiliate` / `#reengagement` 等锚点定位）。

## 🔌 核心 API | Core APIs

### `POST /api/upload` — 文件上传
- 必须登录（NextAuth session）
- 接收 `multipart/form-data`，字段名 `file`
- 单文件上限按账号类型计算（`lib/upload-limits.ts`）：

| 账号类型 | 上限 |
|---|---|
| 注册用户（无订阅） | 10 MB |
| Trial 订阅 | 20 MB |
| Pro / Enterprise 订阅 | 50 MB |

- 超额 / 不支持类型 / 未登录分别返回 `file_too_large_for_plan` / `unsupported_file_type` / `unauthorized`
- 成功返回 `{ key, url? }` —— `url` 仅在配置 `R2_PUBLIC_URL` 时返回；bucket 默认私有

```bash
curl -X POST http://localhost:3000/api/upload \
  -b cookies.txt \
  -F "file=@./example.pdf"
```

### `POST /api/convert` — OCR 转换
- 必须登录
- 必传字段：`fileName`、`fileSize`、`sourceType`（`image` / `pdf` / `text` / `document`）
- 至少提供一种文档载体：
  - **本地文件**：`fileData`（data URL）或 `rawText`（纯文本）
  - **远程 URL**：`documentUrl` / `fileUrl`（https/http）
- 服务端会先做：
  1. URL 探测（HEAD，fallback `Range: bytes=0-0` GET，8 秒超时）→ 校验协议 / SSRF / 扩展名白名单 / 大小 ≤ 50 MB
  2. 积分预检（按预计页数 `* 1`）
  3. 调 Mistral `POST /v1/ocr`（`mistral-ocr-latest`）
  4. 按 `usage_info.pages_processed` 终扣积分
- 错误码：

| HTTP | error code | 触发条件 |
|---|---|---|
| 400 | `invalid_json` | 请求体不是合法 JSON |
| 401 | `unauthorized` | 未登录 |
| 402 | `points_insufficient` | 积分不足（含所需 / 可用 / 预计页数） |
| 413 | `url_too_large` | URL 文件超过 50 MB |
| 415 | `unsupported_url_format` | URL 文件扩展名不在白名单 |
| 422 | `invalid_url` / `url_blocked` / `document_url_required` | 协议错 / SSRF 黑名单 / 未提供文档 |
| 502 | `url_unreachable` / `conversion_failed` | URL 不可达 / Mistral 失败 |
| 503 | `mistral_not_configured` | 服务端未配 MISTRAL_API_KEY 且未开 mock |

- 响应同时包含工作区使用的 `result`（含分块分析、置信度、字数、阅读时间等）和 Mistral 兼容的 `pages` / `model` / `usage_info` / `ocr` 字段，便于本地演示和联调

## 📁 项目结构 | Project Structure

```
├── app/                                # Next.js App Router
│   ├── [locale]/                       # 国际化路由（默认 / 走英文根路径）
│   │   ├── admin/                      # 管理后台（9 大模块）
│   │   ├── affiliate/                  # 推广返利页面
│   │   ├── auth/                       # 认证流程（signin / signup / forgot / reset / verify / error）
│   │   ├── cookies/                    # Cookie 政策
│   │   ├── dashboard/                  # 支付成功页
│   │   ├── newsletter/                 # 退订页
│   │   ├── privacy/                    # 隐私政策
│   │   ├── profile/                    # 用户中心（资料 / 订阅 / 积分 / 推荐 / 支付历史 / 关联账号）
│   │   ├── referral/                   # 推荐奖励页面
│   │   ├── subscription/               # 订阅取消页
│   │   ├── terms/                      # 服务条款
│   │   ├── unauthorized/               # 权限不足页
│   │   ├── layout.tsx                  # 共享布局（SiteChrome + Navbar + Footer）
│   │   └── page.tsx                    # 首页（Hero / BentoFeatures / ConversionZone / ConversionWorkspace / PricingPlans / Testimonials / FAQ）
│   ├── api/                            # API 路由
│   │   ├── admin/                      # 管理员 API（users / set-admin / affiliates / referrals / statistics / reminders / analytics/umami / reengagement 与 campaigns）
│   │   ├── affiliate/                  # 推广（stats / relations / earnings / update-code / withdraw / withdrawals）
│   │   ├── auth/                       # NextAuth + 邮箱验证 / 重置 / 注册 / OAuth 绑定
│   │   ├── convert/                    # OCR 转换（SSRF 探测 + 积分扣费 + Mistral 调用）
│   │   ├── cron/expire-subscriptions/  # Vercel Cron：订阅到期提醒
│   │   ├── newsletter/                 # 订阅 / 退订
│   │   ├── points/                     # 积分流水
│   │   ├── referral/                   # 推荐（stats / records / rewards / update-code）
│   │   ├── stripe/                     # 支付（checkout / create-checkout-session / customer-portal / webhook）
│   │   ├── unsubscribe-subscription/   # 邮件中一键退订订阅到期提醒
│   │   ├── upload/                     # 文件上传至 Cloudflare R2（按订阅档位限制大小）
│   │   └── user/                       # 用户资料 / 订阅 / 积分 / 推荐 / 关联账号 / 改密
│   ├── globals.css                     # 全局样式
│   ├── layout.tsx                      # 根布局
│   ├── page.tsx                        # 根路由重定向
│   └── sitemap.ts                      # 自动生成 sitemap.xml
├── components/
│   ├── admin/                          # 管理后台模块（overview / user-stats / newsletter / referral / affiliate / traffic / reminders / reengagement-list / reengagement-campaigns / reengagement-logs-campaign）
│   ├── affiliate/                      # 推广返利页面组件
│   ├── auth/                           # 登录 / 注册 / 验证 / 重置表单 + OAuth handler
│   ├── cookies/                        # Cookie 政策内容
│   ├── home/                           # 旧版首页 Section
│   ├── newhome/                        # 新版首页 Section（Hero / Navbar / Footer / BentoFeatures / ConversionZone / ConversionWorkspace / PricingPlans / Testimonials / FAQ / Toast / DemoVideoModal）
│   ├── newsletter/                     # 退订页 + Newsletter 统计
│   ├── privacy/                        # 隐私政策内容
│   ├── profile/                        # 用户中心子组件（profile / subscription / points-purchase / payment-history / referral / connected-accounts）
│   ├── providers/                      # SessionProvider / ThemeProvider
│   ├── referral/                       # 推荐页面组件
│   ├── seo/                            # Umami 追踪脚本 + JSON-LD
│   ├── terms/                          # 服务条款内容
│   ├── ui/                             # 基础 UI 组件库（Radix UI 封装，shadcn 风格）
│   └── unauthorized/                   # 权限不足页
├── drizzle/                            # 数据库迁移（15 份）
│   ├── 0000_*.sql ~ 0010_*.sql         # 含 reengagement / locale BCP47 归一化 / 性能索引
│   ├── add_performance_indexes.sql
│   └── meta/                           # Drizzle 元数据
├── lib/
│   ├── auth.ts                         # NextAuth 配置 + 注册赠送积分 + 推广关系绑定
│   ├── auth-utils.ts                   # requireAdmin / requireUser 等守卫
│   ├── db.ts                           # Drizzle 数据库连接
│   ├── schema.ts                       # 数据库表结构（users / accounts / sessions / stripePayments / referrals / affiliateProfiles 等 17 张表）
│   ├── stripe.ts                       # Stripe 客户端
│   ├── payments.ts                     # 订阅 / Checkout 封装
│   ├── points.ts                       # 注册 / 邮箱验证 / 推荐等场景的积分增减
│   ├── points-manager.ts               # 积分流水 + 优先扣赠送策略 + 过期清零
│   ├── referral.ts                     # 推荐奖励发放
│   ├── affiliate.ts                    # 推广返利（30% 首单佣金 + 7 天冻结 + 提现）
│   ├── reengagement-buckets.ts         # 沉睡分桶阈值与 SQL 表达式
│   ├── email.ts                        # Resend 邮件模板
│   ├── r2.ts                           # Cloudflare R2 客户端
│   ├── subscription.ts                 # 订阅状态 / 到期处理
│   ├── upload-limits.ts                # 按订阅档位的上传大小上限
│   ├── seo-config.ts                   # 多语言 SEO 元数据
│   └── utils.ts                        # 通用工具（cn / dateFmt / currency）
├── messages/
│   ├── en.json                         # 英文翻译（默认）
│   ├── zh-CN.json                      # 中文翻译（简体）
│   ├── zh-TW.json                      # 中文翻译（繁体）
│   ├── ja.json                         # 日文翻译
│   └── ko.json                         # 韩文翻译
├── hooks/                              # use-toast / use-mobile / use-api-error
├── i18n/request.js                     # next-intl 配置
├── public/                             # 静态资源（logo / images / manifest / robots）
├── proxy.ts                            # Vercel Edge Middleware 代理
├── components.json                     # shadcn/ui 配置
├── drizzle.config.ts                   # Drizzle Kit 配置
├── next.config.mjs                     # Next.js 配置（含 next-intl 插件）
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                         # Vercel Cron：每天 13:00 触发 expire-subscriptions
└── package.json
```

## 🔧 可用脚本 | Available Scripts

```bash
npm run dev          # 启动开发服务器（http://localhost:3000）
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # ESLint 代码检查

npm run db:push      # 推送 schema 到数据库（开发）
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 执行迁移（生产）
npm run db:studio    # 打开 Drizzle Studio 可视化管理
```

## 🎯 主要页面 | Main Pages

### 👤 用户页面
| 路径 | 说明 |
|---|---|
| `/` | 首页（产品介绍 + Hero + Bento 功能 + 转换区 + 定价 + FAQ） |
| `/auth/signin` | 登录 |
| `/auth/signup` | 注册（支持 `?ref=CODE` 推荐 + `?aff=CODE` 推广） |
| `/auth/forgot-password` | 忘记密码 |
| `/auth/reset-password` | 重置密码 |
| `/auth/verify-email` | 邮箱验证 |
| `/auth/error` | 认证错误回调 |
| `/profile` | 用户中心（资料 / 订阅 / 推荐 / 支付历史 / 关联账号 / 改密） |
| `/dashboard` | 支付成功落地页 |
| `/referral` | 推荐计划（我的推荐码 / 奖励记录） |
| `/affiliate` | 推广返利（推广码 / 佣金 / 提现） |
| `/newsletter/unsubscribe` | 邮件退订 |
| `/subscription/unsubscribe` | 一键关闭订阅到期提醒 |
| `/terms` · `/privacy` · `/cookies` | 法务政策 |
| `/unauthorized` | 权限不足 |

带 locale 前缀：`/zh-CN/...`、`/ja/...`、`/ko/...`、`/zh-TW/...`；英文版走根路径（`/`、`/terms`、`/profile` 等无前缀）。

### 🛡️ 管理后台
`/admin` → 9 大模块，URL hash 切换：
- `#overview` 概览
- `#users` 用户
- `#newsletter` 邮件订阅
- `#referral` 推荐
- `#affiliate` 推广返利
- `#traffic` 流量（Umami）
- `#reminders` 提醒日志
- `#reengagement` 沉睡用户
- `#reengagement-campaigns` 沉睡召回活动

### 🔗 API 端点速览

| 路径 | 说明 |
|---|---|
| `/api/auth/*` | NextAuth、`register`、`verify-email`、`forgot-password`、`reset-password`、`resend-verification`、`oauth-affiliate`、`oauth-referral` |
| `/api/stripe/*` | `checkout`、`create-checkout-session`、`customer-portal`、`webhook` |
| `/api/user/*` | `profile`、`subscription`、`points`、`points/deduct`、`points-detail`、`change-password`、`connected-accounts`、`payments`、`referral` |
| `/api/admin/*` | `users`、`users/[userId]`、`set-admin`、`affiliates`、`referrals`、`statistics`、`analytics/umami`、`reminders`、`reengagement` 与 `reengagement/campaigns/[id]/{count,send,bucket-users}` |
| `/api/affiliate/*` | `stats`、`relations`、`earnings`、`update-code`、`withdraw`、`withdrawals` |
| `/api/referral/*` | `stats`、`records`、`rewards`、`update-code` |
| `/api/newsletter/*` | `subscribe`、`unsubscribe` |
| `/api/points/*` | `history` |
| `/api/convert` | OCR 转换（URL 走 SSRF + 格式 + 大小三重校验） |
| `/api/upload` | 文件上传至 Cloudflare R2（按订阅档位 10/20/50 MB） |
| `/api/cron/expire-subscriptions` | 订阅到期提醒（`CRON_SECRET` 鉴权） |
| `/api/unsubscribe-subscription` | 一键退订订阅到期邮件 |

## 💰 商业模式 | Business Model

FileMarkd 通过 **积分制** 提供文档转换服务：订阅赠送月度积分包，过期清零赠送部分（购买积分永不过期）；额外需求可一次性购买积分。所有付费通道均由 Stripe 托管，Webhook 自动入账。

### 订阅（含积分）
| 套餐 | 价格 | 赠送积分 | 备注 |
|---|---|---|---|
| Trial | $2.99（一次性） | 200 | `STRIPE_TRIAL_PRICE_ID`；每个账号只能试用一次（`hasTrialSubscription`） |
| Pro Monthly | $14.99/月 | 1,500/月 | `STRIPE_PRO_PRICE_ID` |
| Annual | $99/年 | 12,000/年 | `STRIPE_ANNUAL_PRICE_ID`，最佳性价比 |

### 积分包（一次性购买）
| 套餐 | 积分 | 价格 |
|---|---|---|
| Starter | 500 | $5 |
| Popular | 1,500 | $15 |
| Premium | 12,000 | $100 |

### 推荐奖励
- 注册时通过 `?ref=CODE` 绑定
- 双方奖励积分 + 订阅天数延长
- 推荐码可自定义一次

### 推广返利
- 每个用户自动生成 8 位推广码，可自定义一次（`codeChanged`）
- **首单 30% 佣金**，冻结 7 天后解冻，退款自动作废
- 推广关系 30 天有效，过期失效
- **提现最低 $10**，支持支付宝 / PayPal，需管理员在后台审核

## 🔒 安全特性 | Security Features

- **密码哈希**：`bcryptjs` 加盐
- **会话管理**：NextAuth JWT（`session.strategy = 'jwt'`）
- **数据校验**：Zod schema 校验所有 API 输入
- **角色守卫**：`requireAdmin()` / `requireUser()` 保护管理员与用户私有路由
- **SSRF 防护**：`probeRemoteUrl` 拒绝私网 / loopback / IPv6 ULA / link-local / cloud metadata 等地址后再让 Mistral fetch
- **CSRF / Webhook 签名**：Stripe Webhook 验签
- **环境隔离**：敏感配置仅走 `.env.local`

## 📈 SEO 优化 | SEO Optimization

- 每个页面 `generateMetadata` 动态生成标题、描述、hreflang
- 多语言 `sitemap.xml` 自动生成
- JSON-LD 结构化数据（Organization / Product）
- Open Graph + Twitter Card
- `next/image` 懒加载与 WebP

## 🚀 部署指南 | Deployment Guide

### Vercel（推荐）
1. 将仓库 Fork 到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在项目设置中填入环境变量（与 `.env.local` 一致）
4. `vercel.json` 已配置 Cron Job：每天 13:00 触发 `/api/cron/expire-subscriptions`，需要 `CRON_SECRET` 鉴权
5. 部署完成，后续 push 自动触发构建

### Railway / Netlify / DigitalOcean
- 构建命令 `npm run build`、输出目录 `.next`
- 数据库需使用外部 PostgreSQL（推荐 Neon / Supabase / Railway）
- Stripe Webhook 需要配置到生产域名

### 上线前检查清单
- [ ] 替换 `NEXTAUTH_SECRET` 为强随机字符串（`openssl rand -base64 32`）
- [ ] Stripe 切换到 Live 模式 + 真实 Webhook
- [ ] Resend 域名 DNS 验证
- [ ] OAuth 回调地址更新为生产域名
- [ ] `NEXT_PUBLIC_BASE_URL` 改为 `https://`
- [ ] 移除 `MISTRAL_OCR_MOCK`，启用真实 Mistral API
- [ ] 关闭 `npm run dev`，使用 `npm run start` 启动生产

## 🤝 贡献 | Contributing

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/awesome`
3. 提交代码：`git commit -m 'feat: add awesome feature'`
4. 推送分支：`git push origin feature/awesome`
5. 提交 Pull Request

请遵循现有代码风格，公共组件与 API 同步更新五语翻译。

## 📄 许可证 | License

MIT License — 详见 [LICENSE](LICENSE) 文件。

## 📞 支持与社区 | Support & Community

- 📖 [项目主页](https://filemarkd.com)
- 📘 [环境变量配置文档](https://getmoney.wang/zh/article/MokerSaaS)
- 📧 邮箱：app@itusi.cn
- 🐛 提交 Issue：GitHub Issues
- 🐦 Twitter：[@zyailive](https://twitter.com/zyailive)

---

<div align="center">

**🎉 感谢使用 FileMarkd！如果对您有帮助，请给一个 ⭐ Star！**

**Built with Next.js 16 · PostgreSQL · Stripe · Drizzle ORM · Mistral OCR**

</div>
