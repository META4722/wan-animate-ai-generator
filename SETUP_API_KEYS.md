# 🔑 API密钥配置指南

## Fal.ai API密钥设置

为了使用Wan 2.5视频生成功能，您需要配置Fal.ai API密钥。

### 1. 获取API密钥

1. 访问 [https://fal.ai](https://fal.ai)
2. 注册或登录账户
3. 前往 Dashboard > API Keys
4. 创建新的API密钥
5. 复制API密钥（格式类似：`fal_xxxxxxxxxxxxxxxxxxxxx`）

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```bash
# Fal.ai API Key for Wan 2.5 video generation
FAL_KEY=fal_your_actual_api_key_here
```

**注意：**
- 替换 `fal_your_actual_api_key_here` 为您的实际API密钥
- 不要提交包含真实API密钥的文件到Git仓库
- API密钥应保密，不要在公共场所分享

### 3. 重启开发服务器

配置完成后，重启开发服务器使环境变量生效：

```bash
npm run dev
```

### 4. 验证配置

1. 访问 `http://localhost:3000`
2. 滚动到视频生成器区域
3. 尝试生成视频（需要先登录）
4. 如果配置正确，应该不会再看到"API configuration error"错误

## 错误排查

### 常见错误信息及解决方案：

1. **"API configuration error: FAL_KEY is required"**
   - 检查 `.env.local` 文件中是否正确设置了 `FAL_KEY`
   - 确保API密钥没有多余的空格或引号

2. **"Generation failed: {}"**
   - 通常表示API密钥无效或没有权限
   - 验证API密钥是否正确复制
   - 检查Fal.ai账户是否有足够的额度

3. **"Insufficient credits"**
   - Supabase数据库中用户积分不足
   - 需要为用户账户添加积分

## 价格说明

根据API文档，Wan 2.5的计费方式：
- **5秒视频**: 1个积分
- **10秒视频**: 2个积分
- **分辨率倍数**:
  - 480p: 1.0x
  - 720p: 1.5x
  - 1080p: 2.0x

## 支持的功能

✅ **文本转视频**
- 最大800字符提示词
- 支持中英文
- 自动提示词增强
- 背景音频支持

✅ **图片转视频**
- 角色图片 + 参考视频
- 动作迁移
- 面部替换
- 角色替换

✅ **输出格式**
- MP4视频格式
- 多种长宽比：16:9, 9:16, 1:1
- 多种分辨率：480p, 720p, 1080p
- 5秒或10秒时长

## 开发提示

- 在开发过程中，建议使用较低分辨率和较短时长以节省API调用费用
- 生产环境中应该实现用户积分管理系统
- 可以考虑添加队列系统处理大量并发请求