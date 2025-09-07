# RenderFlow 功能规格说明

## 项目定位
AI驱动的建筑渲染平台，面向建筑师、设计师、创意专业人士

## 核心功能模块

### 1. AI渲染工具

#### 1.1 文本转渲染 (Text to Render)
**功能描述**: 通过自然语言描述生成建筑渲染图
**技术实现**:
- AI模型: Stable Diffusion XL / Midjourney API
- 输入: 文本提示词 (最多500字符)
- 输出: 高质量渲染图 (1024x1024, 2048x2048)
- 参数: 风格选择、建筑类型、环境设置

**用户界面**:
```
[文本输入框]
[风格选择器] [建筑类型] [环境设置]
[渲染参数调节] [生成按钮]
```

#### 1.2 立面图转渲染 (Elevation to Render)
**功能描述**: 将2D建筑立面图转换为3D渲染效果图
**技术实现**:
- AI模型: ControlNet + Stable Diffusion
- 输入格式: JPG, PNG, PDF (最大10MB)
- 处理: 边缘检测 + 深度估计
- 输出: 写实渲染图

**处理流程**:
1. 上传立面图 → 2. 边缘检测 → 3. 深度映射 → 4. AI渲染 → 5. 后处理

#### 1.3 3D模型转渲染 (3D Base to Render)
**功能描述**: 3D模型优化渲染和材质增强
**技术实现**:
- 支持格式: OBJ, FBX, 3DS, SKP
- AI处理: 材质识别、光照优化、细节增强
- 渲染引擎: Blender Cycles / V-Ray Cloud

#### 1.4 草图转渲染 (Sketch to Render)
**功能描述**: 手绘草图转换为专业建筑渲染图
**技术实现**:
- AI模型: Sketch-to-Image 专用模型
- 输入: 手绘线稿 (黑白或彩色)
- 处理: 线条识别 + 结构分析 + 渲染生成

#### 1.5 图像转渲染 (Image to Render)
**功能描述**: 现有图像的风格转换和渲染增强
**技术实现**:
- AI模型: Image-to-Image 变换
- 功能: 风格迁移、质量提升、细节增强
- 支持: 照片转手绘、现实转概念等

### 2. 图像处理功能

#### 2.1 图像放大 (Upscaling)
**功能描述**: AI驱动的图像分辨率提升
**技术实现**:
- AI模型: Real-ESRGAN, EDSR
- 放大倍数: 2x, 4x, 8x
- 保持质量: 锐化、去噪、细节恢复

#### 2.2 图像编辑 (Image Editing)
**功能描述**: AI辅助的智能图像修改
**功能列表**:
- 背景移除/替换
- 对象移除/添加
- 光照调整
- 色彩校正
- 透视修正

#### 2.3 图像变体 (Image Variations)
**功能描述**: 基于原图生成多种设计方案
**技术实现**:
- 变体生成: 4-8个方案
- 参数调节: 相似度、创新度
- 批量处理: 一键生成多方案

#### 2.4 AI视频创建 (AI Video Creation)
**功能描述**: 将静态渲染图转换为动画视频
**技术实现**:
- 视频长度: 3-30秒
- 输出格式: MP4, MOV
- 动画效果: 镜头推拉、环绕、光影变化

## 技术架构

### 前端技术栈
- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand / Redux Toolkit
- **文件上传**: React Dropzone
- **图片预览**: React Image Gallery
- **进度显示**: 实时处理状态

### 后端技术栈
- **API**: Node.js + Express / Python + FastAPI
- **AI服务**: 
  - Stability AI API (Stable Diffusion)
  - OpenAI DALL-E API
  - Replicate API (多种模型)
  - 自部署模型 (ComfyUI)
- **文件存储**: AWS S3 / Cloudflare R2
- **队列管理**: Bull Queue + Redis
- **数据库**: PostgreSQL + Prisma

### AI模型集成
```typescript
interface AIService {
  textToRender(prompt: string, params: RenderParams): Promise<RenderResult>
  elevationToRender(imageFile: File, params: RenderParams): Promise<RenderResult>
  sketchToRender(sketchFile: File, params: RenderParams): Promise<RenderResult>
  upscaleImage(imageFile: File, scale: number): Promise<RenderResult>
  createVariations(imageFile: File, count: number): Promise<RenderResult[]>
}
```

## 用户积分系统

### 积分消耗
- 文本转渲染: 2积分/张
- 图像转渲染: 3积分/张
- 3D模型渲染: 5积分/张
- 图像放大: 1积分/张
- 视频创建: 10积分/个

### 订阅计划更新
| 计划 | 价格 | 月积分 | 特殊权限 |
|------|------|--------|----------|
| 免费版 | $0 | 10积分 | 基础功能 |
| Starter | $9/月 | 100积分 | 标准分辨率 |
| Pro | $19/月 | 300积分 | 高分辨率 + 批量处理 |
| Studio | $39/月 | 800积分 | 4K输出 + API访问 |
| Enterprise | $99/月 | 2000积分 | 私有部署 + 定制 |

## 数据库设计

### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  subscription_plan VARCHAR DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 渲染任务表
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  job_type VARCHAR NOT NULL, -- 'text2render', 'sketch2render', etc.
  input_data JSONB,
  output_urls TEXT[],
  status VARCHAR DEFAULT 'pending', -- pending, processing, completed, failed
  credits_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 用户作品集
CREATE TABLE user_galleries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  render_job_id UUID REFERENCES render_jobs(id),
  title VARCHAR,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API端点设计

### 渲染服务 API
```typescript
// 文本转渲染
POST /api/render/text-to-render
{
  prompt: string,
  style: string,
  resolution: string,
  params: RenderParams
}

// 图像上传转渲染
POST /api/render/image-to-render
Content-Type: multipart/form-data
{
  file: File,
  renderType: string,
  params: RenderParams
}

// 获取渲染状态
GET /api/render/status/:jobId

// 获取用户积分
GET /api/user/credits

// 用户作品集
GET /api/gallery/:userId
POST /api/gallery
PUT /api/gallery/:galleryId
DELETE /api/gallery/:galleryId
```

## 性能与优化

### 图像处理优化
- **CDN**: CloudFlare 全球加速
- **压缩**: WebP/AVIF 格式优化
- **缓存**: Redis 结果缓存
- **队列**: 任务队列防止过载

### 用户体验优化
- **实时更新**: WebSocket 进度推送
- **预览功能**: 低分辨率快速预览
- **批量处理**: 多任务并行处理
- **离线功能**: PWA 支持

## 安全与隐私

### 数据安全
- **文件加密**: 上传文件AES加密
- **访问控制**: JWT认证 + RBAC
- **隐私保护**: 用户数据自动清理
- **内容审核**: AI内容安全检查

### API安全
- **速率限制**: Redis限流
- **输入验证**: 文件类型/大小检查  
- **DDoS防护**: Cloudflare保护
- **监控报警**: 异常行为检测