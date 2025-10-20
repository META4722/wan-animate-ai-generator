# 🚀 Wanimate AI 开发和部署指南

## 📋 目录
1. [开发环境设置](#开发环境设置)
2. [项目架构](#项目架构)
3. [开发工作流](#开发工作流)
4. [部署指南](#部署指南)
5. [支付系统准备](#支付系统准备)

---

## 开发环境设置

### 系统要求
- Node.js 18+
- npm 或 yarn
- Git
- Docker (可选，用于本地 Supabase)

### 项目结构
```
wanimate-ai/
├── app/                    # Next.js App Router
│   ├── (auth-pages)/      # 认证页面
│   ├── api/               # API 路由
│   ├── dashboard/         # 用户仪表板
│   └── wan25/             # AI 视频生成
├── components/            # React 组件
├── lib/                   # 工具库
├── utils/                 # 实用函数
├── hooks/                 # 自定义 Hooks
├── types/                 # TypeScript 类型
├── config/                # 配置文件
└── supabase/             # 数据库迁移
```

### 核心技术栈
- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (Google, GitHub OAuth)
- **支付**: Creem.io
- **AI API**: Fal.ai (视频生成), APICore.ai (图像生成)

---

## 项目架构

### 功能模块

#### 🎬 AI 视频生成
- **文本转视频**: 基于提示词生成动画
- **图片转视频**: 图像动画化
- **多分辨率支持**: 480p, 720p, 1080p
- **时长选择**: 5秒, 10秒

#### 💰 积分系统
- **消耗规则**:
  - 480p: 5积分/5秒, 10积分/10秒
  - 720p: 10积分/5秒, 20积分/10秒
  - 1080p: 15积分/5秒, 30积分/10秒
- **获取方式**: 订阅计划, 一次性购买

#### 📊 用户管理
- **认证**: 邮箱/密码, Google, GitHub OAuth
- **仪表板**: 积分余额, 生成历史, 订阅状态
- **个人资料**: 用户设置, 偏好配置

---

## 开发工作流

### 1. 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行类型检查
npm run type-check

# 运行 linting
npm run lint
```

### 2. 数据库开发
```bash
# 检查数据库连接
node scripts/seo-health-check.js

# 添加用户积分
node scripts/add-credits.js user@example.com 100

# 修复用户积分问题
node scripts/fix-user-credits.js
```

### 3. 支付系统测试
```bash
# 检查支付合规性
node scripts/payment-compliance-check.js

# 检查产品准备状态
node scripts/product-readiness-check.js
```

### 4. 代码质量
- **TypeScript**: 严格类型检查
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 自动化

---

## 部署指南

### 开发中模式

当应用还在开发阶段，可以启用维护模式：

```bash
# .env.local
MAINTENANCE_MODE=true
```

这将让用户只能访问首页，其他页面显示"正在开发中"。

### Vercel 部署 (推荐)

#### 1. 准备部署
```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 连接 GitHub 仓库
3. 选择项目并导入

#### 3. 配置环境变量
在 Vercel Dashboard > Settings > Environment Variables 中添加：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API Keys
FAL_KEY=fal_...
NEXT_PUBLIC_APICORE_TOKEN=sk-...

# Creem 支付
CREEM_API_KEY=creem_...
CREEM_API_URL=https://api.creem.io
CREEM_WEBHOOK_SECRET=whsec_...
CREEM_SUCCESS_URL=https://yourdomain.com/dashboard?payment=success

# 站点配置
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 4. 部署
Vercel 会自动部署，通常需要 2-3 分钟。

### 其他部署平台

#### Netlify
1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 发布目录: `.next`
4. 配置环境变量

#### Railway
1. 连接 GitHub 仓库
2. 自动检测 Next.js 项目
3. 配置环境变量
4. 部署

---

## 支付系统准备

### 🎯 支付申请准备清单

#### ✅ 产品准备就绪
- 产品功能完整且可用
- 所有页面正常访问
- 用户流程完整

#### ✅ 内容合规性
- 无虚假信息或夸大宣传
- 产品描述真实准确
- 无虚假用户评价

#### ✅ 法律文件完整
- 隐私政策: `/privacy` ✅
- 服务条款: `/terms` ✅
- 联系页面: `/contact` ✅

#### ✅ 产品可见性
- 产品功能清晰展示
- 定价信息易于访问
- 用户可以理解产品价值

#### ✅ 品牌合规性
- "Wanimate AI" 原创品牌名称
- 无商标侵权风险
- 品牌形象专业

#### ✅ 定价透明度
- 定价页面清晰展示
- 积分系统说明详细
- 订阅计划对比明确

#### ✅ 技术合规性
- AI 视频生成技术合法
- 用户数据保护完善
- 安全措施到位

#### ✅ 客户支持
- 支持邮箱: support@wanimate.io
- 联系页面完整
- 客服信息可达

### 业务信息
- **公司名称**: Wanimate AI
- **业务类型**: AI视频动画服务
- **网站URL**: https://your-domain.com
- **联系邮箱**: support@wanimate.io
- **客服电话**: +44 07871838925
- **业务地址**: Shanghai, China

### 支付申请建议

#### 对于 Stripe
1. 强调 AI 技术的创新性和合法性
2. 提供详细的业务模式说明
3. 展示完整的用户流程
4. 准备技术文档和集成说明

#### 对于 PayPal
1. 重点说明创意行业应用
2. 提供客户支持流程
3. 展示网站专业性
4. 准备业务注册文件

---

## 维护和监控

### 日常维护
```bash
# 检查系统健康状态
node scripts/seo-health-check.js

# 检查支付合规性
node scripts/payment-compliance-check.js

# 检查产品准备状态
node scripts/product-readiness-check.js
```

### 监控指标
- 用户注册和活跃度
- 视频生成成功率
- 支付转化率
- 系统性能和错误率

### 备份策略
- 数据库定期备份
- 代码版本控制
- 环境变量安全存储
- 用户数据保护

---

## 支持和帮助

### 开发支持
- 📧 技术问题: support@wanimate.io
- 📖 文档: 查看项目 README.md
- 🐛 Bug 报告: GitHub Issues

### 部署支持
- Vercel 文档: [vercel.com/docs](https://vercel.com/docs)
- Supabase 文档: [supabase.com/docs](https://supabase.com/docs)
- Next.js 文档: [nextjs.org/docs](https://nextjs.org/docs)

---

**状态**: ✅ 准备就绪，可以申请支付处理服务并部署到生产环境
**最后更新**: 2025年10月11日