# 🇨🇳 Raphael Starter Kit - AI中文名字生成器

> 基于 Next.js、Supabase 和 Creem.io 构建的现代化SaaS启动套件

一个完整的AI驱动中文名字生成器，融合先进的AI技术与深厚的中华文化底蕴，为全球用户提供个性化、文化准确的中文名字生成服务。

[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4)](https://tailwindcss.com/)

## ✨ 项目亮点

🤖 **智能AI生成** - 基于OpenAI/OpenRouter的先进语言模型，理解个性特征和文化背景
🏮 **文化准确性** - 深度融合中华传统命名文化，确保每个名字都有深刻寓意
⚡ **即时生成** - 秒级响应，提供完整的字符解析、拼音标注和文化解释
🎯 **个性匹配** - 根据用户的性格特征、出生年份和喜好偏向量身定制
🔊 **语音播放** - 集成豆包TTS，提供准确的中文名字发音
📱 **响应式设计** - 完美适配各种设备，优雅的用户体验

## 🚀 技术栈

### 核心框架
- **Frontend**: Next.js 13+ (App Router) + React 19 + TypeScript
- **Styling**: TailwindCSS + Radix UI + Framer Motion
- **Authentication**: Supabase Auth (Email/OAuth)
- **Database**: Supabase PostgreSQL
- **Payment**: Creem.io (全球支付，中国友好)
- **AI Service**: OpenAI/OpenRouter API
- **Voice**: 豆包TTS (ByteDance)

### 开发工具
- **IDE**: VS Code/Cursor 优化配置
- **Type Safety**: 完整的TypeScript类型系统
- **UI Components**: Shadcn/ui + 自定义组件库
- **Deployment**: Vercel 一键部署

## 🏗️ 项目结构

```
Rendaily-V1/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (auth-pages)/        # 认证相关页面
│   ├── 📁 dashboard/           # 用户仪表板
│   ├── 📁 api/                 # API路由
│   │   ├── 📁 chinese-names/   # 名字生成API
│   │   ├── 📁 webhooks/        # 支付回调
│   │   └── 📁 tts/             # 语音合成API
│   └── 📄 page.tsx            # 首页
├── 📁 components/              # React组件
│   ├── 📁 ui/                  # 基础UI组件
│   ├── 📁 product/             # 业务组件
│   └── 📁 dashboard/           # 仪表板组件
├── 📁 hooks/                   # 自定义React钩子
├── 📁 lib/                     # 核心工具库
├── 📁 utils/                   # 工具函数
│   ├── 📁 supabase/           # Supabase客户端
│   ├── 📁 creem/              # 支付集成
│   └── 📁 pdf-templates/      # PDF生成
├── 📁 types/                   # TypeScript类型
└── 📁 config/                  # 配置文件
```

## ✨ 核心功能

### 🤖 AI名字生成
- **智能分析**: 基于用户输入的英文名、性别、出生年份和个性特征
- **文化融合**: 结合传统中文命名文化和现代审美
- **多样选择**: 每次生成6个不同风格的中文名字选项
- **详细解释**: 包含汉字含义、拼音标注、文化背景和性格匹配度

### 🔐 用户系统
- **多种登录方式**: 邮箱注册、Google OAuth
- **用户状态管理**: 基于Supabase的安全会话管理  
- **路由保护**: 中间件级别的认证检查
- **个人中心**: 生成历史、收藏管理、账户设置

### 💰 商业化功能
- **免费体验**: 未注册用户每日3次免费生成
- **订阅制**: 月付/年付无限生成套餐
- **积分制**: 灵活的按次付费选项
- **全球支付**: Creem.io支持多种支付方式

### 🎵 语音功能
- **真人发音**: 豆包TTS提供标准普通话发音
- **即时播放**: 点击即可听到名字的正确读音
- **发音指导**: 帮助用户掌握中文名字的发音

## 快速开始

### 前提条件

- Node.js 18+ 和 npm
- Supabase 账户
- Creem.io 账户

### 步骤 1: 克隆仓库

```bash
git clone https://github.com/yourusername/raphael-starter-kit.git
cd raphael-starter-kit
```

### 步骤 2: 安装依赖

```bash
npm i
```

### 步骤 3: 设置 Supabase

1. 在 [Supabase](https://app.supabase.com) 上创建一个新项目
   - 点击"新建项目"
   - 填写基本信息（项目名称、密码等）

2. 前往 项目设置 > API 获取项目凭证
   - 从项目设置页面复制凭证信息
   - 将凭证粘贴到.env文件中

3. 配置登录认证
   - 选择【Auth】>【Providers】
   - 选择email认证
   - 关闭"Confirm email"选项并保存设置

4. (可选) 设置Google登录
   - 进入[Google 开发者控制台](https://console.cloud.google.com)，创建新项目
   - 配置项目权限
   - 前往【API与服务】>【凭据】
   - 创建OAuth客户端ID
   - 添加授权来源URL和重定向URI
   - 重定向URI格式: `https://<项目ID>.supabase.co/auth/v1/callback`
   - 复制OAuth客户端ID和密钥

5. 在Supabase配置Google认证
   - 打开Auth > Providers > Google
   - 填写从Google开发者控制台获取的客户端ID和密钥
   - 启用Google认证

6. 设置定向URL
   - 将定向URL更改为您的线上地址
   - 确保URL与Google开发者控制台中的地址完全一致

7. 设置环境变量
   ```bash
   cp .env.example .env.local
   ```
   
   在`.env.local`中更新Supabase变量:
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
   SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
   ```

8. 创建数据库表结构
   - 复制SQL代码到Supabase SQL编辑器
   - 执行SQL创建必要的表结构

### 步骤 4: 设置 Creem.io

1. 登录到 [Creem.io 仪表板](https://www.creem.io/)
2. 初始设置
   - 打开测试模式
   - 导航到顶部导航栏中的"开发者"部分
   - 复制API Key并粘贴到.env文件中

3. 创建Webhooks
   - 前往开发者 > Webhooks
   - 创建新的Webhook
   - 填写URL: `https://你的域名/api/webhooks/creem`
   - 复制Webhook密钥并粘贴到.env文件中

4. 更新环境变量
   ```
   CREEM_API_URL=https://test-api.creem.io/v1
   ```

5. 创建收费项目
   - 在Creem.io中创建订阅项目和积分项目
   - 复制项目ID并配置到代码中

6. 完整的环境变量示例
   ```
   # Supabase配置
   NEXT_PUBLIC_SUPABASE_URL=你的supabaseURL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase pubilc key
   SUPABASE_SERVICE_ROLE_KEY=你的supabase SERVICE_ROLE key

   # Creem配置
   CREEM_WEBHOOK_SECRET=你的webhook key
   CREEM_API_KEY=你的creem key
   CREEM_API_URL=https://test-api.creem.io/v1

   # 站点URL配置
   NEXT_PUBLIC_SITE_URL=http://你的线上地址
   
   # 支付成功后的重定向URL
   CREEM_SUCCESS_URL=http://你的线上地址/dashboard
   ```

### 步骤 5: 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的应用程序。

### 步骤 6: Vercel部署

1. 将代码推送到GitHub
2. 将仓库导入到[Vercel](https://vercel.com)
3. 添加所有环境变量
4. 完成部署

### 步骤 7: 更新Webhook回调地址

1. 进入Creem.io，打开开发者模式
2. 更新Webhooks配置
   - 进入对应的Webhook设置
   - 点击"更多"，选择"编辑"
   - 将线上地址更新为: `https://你的域名/api/webhooks/creem`

### 步骤 8: 测试系统功能

1. 测试用户登录功能
2. 测试订阅支付功能（测试信用卡号: 4242 4242 4242 4242）
3. 测试积分购买功能

### 步骤 9: 设计网站首页

1. 使用组件库
   - 您可以使用[TailwindCSS](https://tailwindcss.com)上的组件
   - 复制代码到相应的组件文件中

2. 自定义页面配色
   - 调整全局色系
   - 将样式代码添加到全局CSS文件中

3. 根据需要精修页面布局

### 步骤 10: 切换到正式付款

1. 进入Creem.io，关闭测试模式
2. 创建新的正式项目，将ID更新到代码中
3. 更新环境变量，将API URL从测试环境切换到正式环境:
   ```
   # 将此行
   CREEM_API_URL=https://test-api.creem.io/v1
   
   # 替换为
   CREEM_API_URL=https://api.creem.io
   ```

## 💳 订阅系统详情

启动套件包含由 Creem.io 提供支持的完整订阅系统：

- 多级订阅方案
- 基于使用量的计费
- 积分系统
- 订阅管理
- 安全支付处理
- Webhook 集成实时更新
- 自动发票生成
- 全球支付支持（特别适合中国大陆商家）

### 设置 Webhooks

处理订阅更新和支付事件:

1. 前往 Creem.io 仪表板
2. 导航到 开发者 > Webhooks
3. 添加你的 webhook 端点: `https://your-domain.com/api/webhooks/creem`
4. 复制 webhook 密钥并添加到你的 `.env.local`:
   ```
   CREEM_WEBHOOK_SECRET=你的webhook密钥
   ```

## 项目结构

```
├── app/                   # Next.js 应用目录
│   ├── (auth-pages)/     # 身份验证页面
│   ├── dashboard/        # 仪表板页面
│   ├── api/             # API 路由
│   └── layout.tsx       # 根布局
├── components/           # React 组件
│   ├── ui/             # Shadcn/ui 组件
│   ├── dashboard/      # 仪表板组件
│   └── home/          # 登陆页面组件
│   └── layout/        # 页面布局组件
├── hooks/               # 自定义 React 钩子
├── lib/                # 工具库
├── public/             # 静态资源
├── styles/             # 全局样式
├── types/              # TypeScript 类型
└── utils/              # 工具函数
```

## 支持与联系

如果您有任何问题或需要支持，请通过微信联系我们。
