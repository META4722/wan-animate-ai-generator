# 🗄️ Supabase数据库配置指南

## 第一步：设置Supabase项目

### 1. 创建Supabase项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击"New Project"创建新项目
4. 填写项目信息：
   - **Name**: `wan-animate-ai` (或你喜欢的名称)
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离你最近的区域

### 2. 获取项目配置信息
项目创建完成后，在Project Settings > API中找到：
- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: `eyJ...` (很长的JWT token)

## 第二步：配置环境变量

在 `.env.local` 文件中添加Supabase配置：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (仅服务端使用，保密)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**: 替换为你实际的项目URL和密钥

## 第三步：运行数据库迁移

### 1. 安装Supabase CLI (如果还没安装)
```bash
npm install -g @supabase/cli
```

### 2. 登录Supabase
```bash
npx supabase login
```

### 3. 初始化本地配置
```bash
npx supabase init
```

### 4. 链接到你的项目
```bash
npx supabase link --project-ref your-project-id
```

### 5. 推送数据库迁移
```bash
npx supabase db push
```

这将执行以下迁移文件：
- ✅ `20240326000000_init_tables.sql` - 基础表结构
- ✅ `20241229000000_chinese_names_tables.sql` - 中文名字表
- ✅ `20241229000002_auto_create_customer.sql` - 自动创建客户记录
- ✅ `20241230000000_add_ip_rate_limiting.sql` - IP限制
- ✅ `20250929000000_video_generation_system.sql` - 视频生成系统

## 第四步：验证数据库设置

### 1. 检查表是否创建成功
在Supabase Dashboard > Table Editor中应该看到以下表：
- `customers` - 客户信息和积分
- `credits_history` - 积分历史记录
- `video_generations` - 视频生成任务
- `file_uploads` - 文件上传记录
- `user_video_preferences` - 用户偏好设置

### 2. 启用Row Level Security (RLS)
所有表都已配置RLS策略，确保数据安全。

## 第五步：为你的账户添加积分

### 方法1: 通过Supabase Dashboard手动添加

1. 进入Supabase Dashboard > Table Editor
2. 找到 `customers` 表
3. 找到你的用户记录，或手动创建一条记录：
   ```sql
   INSERT INTO customers (
     user_id,
     email,
     credits,
     creem_customer_id
   ) VALUES (
     'your-user-id-from-auth-users',
     'your-email@example.com',
     100,  -- 给你100个积分
     'manual_' || 'your-user-id'
   );
   ```

### 方法2: 通过SQL脚本添加

在Supabase Dashboard > SQL Editor中运行：

```sql
-- 为特定邮箱的用户添加积分
INSERT INTO customers (
  user_id,
  email,
  credits,
  creem_customer_id,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  100,  -- 积分数量
  'admin_' || id,
  now(),
  now()
FROM auth.users
WHERE email = 'your-email@example.com'  -- 替换为你的邮箱
ON CONFLICT (user_id)
DO UPDATE SET
  credits = customers.credits + 100,  -- 如果已存在，则增加积分
  updated_at = now();

-- 记录积分添加历史
INSERT INTO credits_history (
  customer_id,
  amount,
  type,
  description,
  created_at
)
SELECT
  c.id,
  100,
  'add',
  'Manual admin credit addition',
  now()
FROM customers c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- 替换为你的邮箱
```

### 方法3: 创建管理员API端点

我可以为你创建一个管理员API来方便地添加积分。

## 第六步：测试配置

### 1. 重启开发服务器
```bash
npm run dev
```

### 2. 注册/登录账户
访问 `http://localhost:3000/sign-up` 创建账户

### 3. 检查积分
- 访问 `/dashboard` 查看积分余额
- 或者在Supabase Dashboard中查看 `customers` 表

### 4. 测试视频生成
- 访问首页滚动到视频生成器
- 或者直接访问 `/wan25`
- 尝试生成视频，应该不会再看到"Insufficient credits"错误

## 常见问题排查

### 1. 连接问题
- 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
- 确保URL没有尾随斜杠

### 2. RLS策略问题
- 确保用户已登录
- 检查 `auth.users` 表中是否有用户记录

### 3. 积分不显示
- 确保 `customers` 表中有对应的用户记录
- 检查 `user_id` 是否与 `auth.users.id` 匹配

## 下一步

配置完成后，你就可以：
- 🎬 使用视频生成功能
- 💰 管理用户积分系统
- 📊 查看使用统计
- 🔐 享受完整的用户认证流程

需要帮助设置具体步骤吗？我可以为你创建自动化脚本！