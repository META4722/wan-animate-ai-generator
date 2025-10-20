# 🎨 Wanimate AI 设计和品牌指南

## 📋 目录
1. [品牌标识](#品牌标识)
2. [颜色系统](#颜色系统)
3. [设计系统](#设计系统)
4. [组件库](#组件库)
5. [图片和媒体](#图片和媒体)
6. [响应式设计](#响应式设计)

---

## 品牌标识

### 品牌名称
**Wanimate AI** - AI驱动的视频动画生成平台

### 品牌定位
- **创新**: 前沿的AI技术
- **易用**: 简单直观的用户体验
- **专业**: 高质量的视频输出
- **创意**: 激发用户创造力

### 品牌语调
- 友好而专业
- 技术先进但易于理解
- 鼓励创新和实验
- 支持性和帮助性

---

## 颜色系统

### 主色调 (Primary Colors)
```css
/* 主品牌色 - 蓝色系 */
--primary: 221 83% 53%;           /* #2563eb - 主要按钮、链接 */
--primary-foreground: 210 40% 98%; /* #f8fafc - 主色上的文字 */

/* 次要色 - 紫色系 */
--secondary: 210 40% 96%;         /* #f1f5f9 - 次要按钮、背景 */
--secondary-foreground: 222 84% 5%; /* #0f172a - 次要色上的文字 */
```

### 中性色 (Neutral Colors)
```css
/* 背景色 */
--background: 0 0% 100%;          /* #ffffff - 主背景 */
--foreground: 222 84% 5%;         /* #0f172a - 主文字 */

/* 卡片和容器 */
--card: 0 0% 100%;                /* #ffffff - 卡片背景 */
--card-foreground: 222 84% 5%;    /* #0f172a - 卡片文字 */

/* 静音色 */
--muted: 210 40% 96%;             /* #f1f5f9 - 静音背景 */
--muted-foreground: 215 16% 47%;  /* #64748b - 静音文字 */
```

### 状态色 (Status Colors)
```css
/* 成功 */
--success: 142 76% 36%;           /* #16a34a - 成功状态 */
--success-foreground: 355 7% 97%; /* #f7f7f7 - 成功文字 */

/* 警告 */
--warning: 38 92% 50%;            /* #f59e0b - 警告状态 */
--warning-foreground: 48 96% 89%; /* #fef3c7 - 警告文字 */

/* 错误 */
--destructive: 0 84% 60%;         /* #ef4444 - 错误状态 */
--destructive-foreground: 210 40% 98%; /* #f8fafc - 错误文字 */
```

### 暗色主题
```css
.dark {
  --background: 222 84% 5%;        /* #0f172a - 暗色背景 */
  --foreground: 210 40% 98%;       /* #f8fafc - 暗色文字 */
  --card: 222 84% 5%;              /* #0f172a - 暗色卡片 */
  --card-foreground: 210 40% 98%;  /* #f8fafc - 暗色卡片文字 */
  --muted: 217 33% 17%;            /* #1e293b - 暗色静音 */
  --muted-foreground: 215 20% 65%; /* #94a3b8 - 暗色静音文字 */
  --border: 217 33% 17%;           /* #1e293b - 暗色边框 */
}
```

---

## 设计系统

### 字体系统

#### 字体族
```css
/* 主字体 - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 代码字体 - JetBrains Mono */
font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### 字体大小
```css
/* 标题 */
.text-4xl { font-size: 2.25rem; }  /* 36px - 主标题 */
.text-3xl { font-size: 1.875rem; } /* 30px - 次标题 */
.text-2xl { font-size: 1.5rem; }   /* 24px - 小标题 */
.text-xl  { font-size: 1.25rem; }  /* 20px - 大文本 */

/* 正文 */
.text-lg  { font-size: 1.125rem; } /* 18px - 大正文 */
.text-base{ font-size: 1rem; }     /* 16px - 标准正文 */
.text-sm  { font-size: 0.875rem; } /* 14px - 小文本 */
.text-xs  { font-size: 0.75rem; }  /* 12px - 极小文本 */
```

### 间距系统

#### 内边距和外边距
```css
/* 基础间距 (4px 基数) */
.p-1  { padding: 0.25rem; }  /* 4px */
.p-2  { padding: 0.5rem; }   /* 8px */
.p-3  { padding: 0.75rem; }  /* 12px */
.p-4  { padding: 1rem; }     /* 16px */
.p-6  { padding: 1.5rem; }   /* 24px */
.p-8  { padding: 2rem; }     /* 32px */
.p-12 { padding: 3rem; }     /* 48px */
.p-16 { padding: 4rem; }     /* 64px */
```

### 圆角系统
```css
--radius: 0.5rem;               /* 8px - 默认圆角 */

.rounded-none { border-radius: 0; }
.rounded-sm   { border-radius: 0.125rem; } /* 2px */
.rounded      { border-radius: 0.25rem; }  /* 4px */
.rounded-md   { border-radius: 0.375rem; } /* 6px */
.rounded-lg   { border-radius: 0.5rem; }   /* 8px */
.rounded-xl   { border-radius: 0.75rem; }  /* 12px */
.rounded-2xl  { border-radius: 1rem; }     /* 16px */
.rounded-full { border-radius: 9999px; }
```

---

## 组件库

### 按钮组件

#### 主要按钮
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Generate Video
</Button>
```

#### 次要按钮
```tsx
<Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Cancel
</Button>
```

### 卡片组件
```tsx
<Card className="bg-card text-card-foreground border border-border">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <!-- Card content -->
  </CardContent>
</Card>
```

---

## 图片和媒体

### 图片存储策略

#### 本地存储 (开发环境)
- 路径: `public/images/`
- 格式: WebP (优先), PNG, JPG
- 优化: 使用 Next.js Image 组件自动优化

#### 云存储 (生产环境)
- **Supabase Storage**: 用户上传的图片和生成的视频
- **CDN**: 静态资源和优化后的图片
- **压缩**: 自动压缩和格式转换

### 图片规格

#### 用户头像
- 尺寸: 200x200px
- 格式: WebP, PNG
- 最大文件大小: 2MB

#### 视频缩略图
- 尺寸: 16:9 比例
- 分辨率: 480x270px (预览)
- 格式: WebP, JPG

#### 生成的视频
- 分辨率: 480p, 720p, 1080p
- 格式: MP4 (H.264)
- 时长: 5秒, 10秒
- 帧率: 24fps

---

## 响应式设计

### 断点系统
```css
/* Tailwind CSS 断点 */
sm: '640px',   /* 小屏幕 (手机横屏) */
md: '768px',   /* 中等屏幕 (平板) */
lg: '1024px',  /* 大屏幕 (桌面) */
xl: '1280px',  /* 超大屏幕 */
2xl: '1536px'  /* 超宽屏幕 */
```

### 响应式布局

#### 网格系统
```tsx
<!-- 响应式网格 -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 网格项目 -->
</div>
```

#### 弹性布局
```tsx
<!-- 响应式弹性布局 -->
<div className="flex flex-col md:flex-row gap-4">
  <!-- 弹性项目 -->
</div>
```

### 移动端优化

#### 触摸友好
- 按钮最小尺寸: 44x44px
- 触摸目标间距: 8px
- 滑动手势支持

#### 性能优化
- 图片懒加载
- 代码分割
- 预加载关键资源

---

## 可访问性

### 颜色对比
- 正文文字: 至少 4.5:1 对比度
- 大文字: 至少 3:1 对比度
- 非文字元素: 至少 3:1 对比度

### 键盘导航
- Tab 键顺序逻辑
- 焦点指示器清晰
- 跳过链接支持

### 屏幕阅读器
- 语义化 HTML
- ARIA 标签完整
- 图片 alt 文本

---

**设计系统版本**: v1.0
**最后更新**: 2025年1月31日
**维护者**: Wanimate AI 设计团队