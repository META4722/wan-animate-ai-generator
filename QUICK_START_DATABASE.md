# 🚀 快速开始：数据库配置

## 第一步：配置Supabase环境变量

### 1. 获取Supabase项目信息
1. 访问 [https://supabase.com](https://supabase.com)
2. 登录你的账户
3. 选择或创建项目
4. 进入 **Settings** > **API**
5. 复制以下信息：
   - **Project URL** (格式: `https://xxxxx.supabase.co`)
   - **anon/public** key (以 `eyJ` 开头的长字符串)
   - **service_role** key (以 `eyJ` 开头的长字符串，保密)

### 2. 更新 .env.local 文件
将以下内容替换为你的实际值：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
```

## 第二步：运行数据库迁移

### 选项A: 使用Supabase Dashboard (推荐)

1. 打开 Supabase Dashboard > **SQL Editor**
2. 依次执行以下迁移文件的内容：

#### 2.1 基础表结构
复制并执行 `supabase/migrations/20240326000000_init_tables.sql` 的内容

#### 2.2 自动创建客户记录
复制并执行 `supabase/migrations/20241229000002_auto_create_customer.sql` 的内容

#### 2.3 视频生成系统
复制并执行 `supabase/migrations/20250929000000_video_generation_system.sql` 的内容

### 选项B: 使用Supabase CLI

```bash
# 安装CLI
npm install -g @supabase/cli

# 登录
npx supabase login

# 链接项目
npx supabase link --project-ref your-project-id

# 推送迁移
npx supabase db push
```

## 第三步：测试连接

```bash
# 检查数据库连接
node scripts/check-db.js
```

如果一切正常，你应该看到所有绿色的 ✅ 标记。

## 第四步：创建测试账户并添加积分

### 1. 注册账户
访问 `http://localhost:3000/sign-up` 并注册一个测试账户

### 2. 添加积分
```bash
# 为你的邮箱添加100个积分
node scripts/add-credits.js your-email@example.com 100
```

### 3. 验证积分
- 访问 `/dashboard` 查看积分余额
- 或再次运行 `node scripts/check-db.js`

## 第五步：测试视频生成

1. 访问 `http://localhost:3000`
2. 滚动到视频生成器区域
3. 登录你的账户
4. 尝试生成视频：
   - **文本转视频**: 输入描述文字
   - **图片转视频**: 上传图片和参考视频

## 快速命令参考

```bash
# 检查数据库状态
node scripts/check-db.js

# 添加积分
node scripts/add-credits.js user@example.com 100

# 重启开发服务器
npm run dev
```

## 常见问题

### ❌ "数据库连接失败"
- 检查 `.env.local` 中的 URL 和密钥是否正确
- 确保没有多余的空格或引号
- 验证 Supabase 项目是否处于活跃状态

### ❌ "表不存在"
- 确保已执行所有数据库迁移
- 检查 Supabase Dashboard > Table Editor 中是否有相应的表

### ❌ "Insufficient credits"
- 使用 `add-credits.js` 脚本为用户添加积分
- 确保用户已注册并且 `customers` 表中有对应记录

### ❌ "Unauthorized"
- 确保用户已登录
- 检查 RLS 策略是否正确设置

## 成功指标

当以下条件满足时，说明配置成功：

✅ `node scripts/check-db.js` 全部显示绿色
✅ 可以成功注册和登录
✅ Dashboard 显示正确的积分余额
✅ 视频生成功能可以调用 API（不再显示 "Insufficient credits"）
✅ 可以在 Supabase Dashboard 中看到生成的数据记录

配置完成后，你就拥有了一个完整的AI视频生成平台！🎉