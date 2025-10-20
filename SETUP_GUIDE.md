# 🚀 Wanimate AI 完整设置指南

## 📋 目录
1. [环境准备](#环境准备)
2. [Supabase 数据库设置](#supabase-数据库设置)
3. [API 密钥配置](#api-密钥配置)
4. [OAuth 认证设置](#oauth-认证设置)
5. [快速启动](#快速启动)
6. [故障排除](#故障排除)

---

## 环境准备

### 系统要求
- Node.js 18+ 
- npm 或 yarn
- Git

### 克隆项目
```bash
git clone <your-repo-url>
cd wanimate-ai
npm install
```

---

## Supabase 数据库设置

### 1. 创建 Supabase 项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击"New Project"创建新项目
4. 填写项目信息：
   - **Name**: `wanimate-ai`
   - **Database Password**: 设置强密码
   - **Region**: 选择最近的区域

### 2. 获取项目配置
在 Project Settings > API 中获取：
- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: `eyJ...` (JWT token)
- **service_role key**: `eyJ...` (保密)

### 3. 配置环境变量
创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 运行数据库迁移

#### 方法 A: Supabase Dashboard (推荐)
1. 打开 Supabase Dashboard > SQL Editor
2. 依次执行 `supabase/migrations/` 目录下的迁移文件

#### 方法 B: Supabase CLI
```bash
npm install -g @supabase/cli
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

### 5. 验证数据库
检查以下表是否创建成功：
- `customers` - 客户信息和积分
- `credits_history` - 积分历史
- `video_generations` - 视频生成任务
- `file_uploads` - 文件上传记录

---

## API 密钥配置

### Fal.ai API (视频生成)

#### 1. 获取 API 密钥
1. 访问 [https://fal.ai](https://fal.ai)
2. 注册/登录账户
3. 前往 Dashboard > API Keys
4. 创建新的 API 密钥

#### 2. 添加到环境变量
```bash
# Fal.ai API for Wan 2.5 video generation
FAL_KEY=fal_your_actual_api_key_here
```

### APICore.ai (图像生成)

#### 1. 获取 API 密钥
1. 访问 [https://apicore.ai](https://apicore.ai)
2. 注册账户并获取 API token

#### 2. 添加到环境变量
```bash
# APICore.ai for image generation
NEXT_PUBLIC_APICORE_TOKEN=sk-your-api-token-here
```

### Creem 支付系统

#### 1. 获取 Creem 配置
1. 访问 [https://creem.io](https://creem.io)
2. 创建账户并获取 API 密钥

#### 2. 添加到环境变量
```bash
# Creem 支付配置
CREEM_API_KEY=creem_test_your_api_key
CREEM_API_URL=https://test-api.creem.io
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret
CREEM_SUCCESS_URL=http://localhost:3000/dashboard?payment=success
```

---

## OAuth 认证设置

### Google OAuth

#### 1. Google Cloud Console 设置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目或选择现有项目
3. 启用 Google+ API
4. 配置 OAuth 同意屏幕：
   - App name: `Wanimate AI`
   - User support email: 你的邮箱
   - Scopes: `email`, `profile`

#### 2. 创建 OAuth 凭据
1. 创建 OAuth 2.0 Client ID
2. 应用类型：Web application
3. 授权来源：
   - `http://localhost:3000` (开发)
   - `https://yourdomain.com` (生产)
4. 重定向 URI：
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

#### 3. Supabase 配置
1. Supabase Dashboard > Authentication > Providers
2. 启用 Google
3. 输入 Client ID 和 Client Secret

### GitHub OAuth

#### 1. GitHub 设置
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App：
   - Application name: `Wanimate AI`
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://your-supabase-project.supabase.co/auth/v1/callback`

#### 2. Supabase 配置
1. Supabase Dashboard > Authentication > Providers
2. 启用 GitHub
3. 输入 Client ID 和 Client Secret

---

## 快速启动

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 创建测试账户
访问 `http://localhost:3000/sign-up` 注册账户

### 3. 添加测试积分
```bash
node scripts/add-credits.js your-email@example.com 100
```

### 4. 测试功能
- 访问 `/dashboard` 查看积分
- 尝试生成视频功能
- 测试支付流程

---

## 故障排除

### 数据库连接问题
```bash
# 检查数据库连接
node scripts/seo-health-check.js
```

**常见错误**：
- ❌ URL 或密钥错误 → 检查 `.env.local` 配置
- ❌ 表不存在 → 重新运行数据库迁移
- ❌ RLS 策略问题 → 确保用户已登录

### API 配置问题
**Fal.ai 错误**：
- `API configuration error` → 检查 `FAL_KEY` 设置
- `Insufficient credits` → 为用户添加积分
- `Generation failed` → 验证 API 密钥有效性

**支付系统错误**：
- Webhook 未收到 → 检查 Creem 配置和 URL
- 积分未添加 → 查看 webhook 日志

### OAuth 认证问题
- `Redirect URI mismatch` → 检查回调 URL 配置
- `Domain not authorized` → 添加域名到授权列表
- `Provider not enabled` → 在 Supabase 中启用对应提供商

### 开发工具
```bash
# 检查系统状态
node scripts/product-readiness-check.js

# 支付合规检查
node scripts/payment-compliance-check.js

# 修复用户积分
node scripts/fix-user-credits.js
```

---

## 生产部署注意事项

1. **环境变量**：更新所有 URL 为生产域名
2. **OAuth 配置**：添加生产域名到授权列表
3. **API 密钥**：使用生产环境的 API 密钥
4. **HTTPS**：确保生产环境使用 HTTPS
5. **监控**：设置错误监控和日志记录

---

## 支持

如需帮助，请联系：
- 📧 Email: support@wanimate.io
- 📖 文档: 查看项目 README.md
- 🐛 问题: 提交 GitHub Issue

设置完成后，你就拥有了一个完整的 AI 视频生成平台！🎉