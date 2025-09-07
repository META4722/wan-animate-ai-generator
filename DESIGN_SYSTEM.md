# RenderFlow 设计系统详细分析

## 技术栈
- **框架**: Next.js React 应用
- **CSS 框架**: Tailwind CSS
- **样式方法**: 实用程序优先 (Utility-first) CSS
- **渲染**: 服务端渲染 (SSR)

## 颜色系统

### 主题支持
- **主题模式**: system | light | dark
- **自适应**: 支持系统主题检测
- **手动切换**: 用户可手动切换主题

### 色彩变量
```css
/* 基础色彩类 */
.bg-background     /* 背景色 */
.text-foreground   /* 前景文字色 */
```

### 品牌色彩方案
基于品牌指定的主题色和字体色：
```css
:root {
  /* 品牌核心色彩 */
  --brand-primary: #b09df2;       /* 主题色 - 薰衣草紫 */
  --brand-text: #342d4b;          /* 字体色 - 深紫灰 */
  
  /* HSL 格式 (用于 Tailwind CSS) */
  --primary: 256 73% 76%;         /* #b09df2 */
  --foreground: 246 25% 25%;      /* #342d4b */
  
  /* 基础色彩系统 */
  --background: 0 0% 100%;        /* 白色背景 */
  --secondary: 256 73% 85%;       /* 主题色浅色版 */
  --muted: 246 15% 95%;          /* 静音色 */
  --accent: 256 73% 76%;         /* 强调色 = 主题色 */
  --border: 246 15% 88%;         /* 边框色 */
  --input: 246 15% 96%;          /* 输入框背景 */
  
  /* 功能色彩 */
  --destructive: 0 84% 60%;       /* 错误/删除 - 红色 */
  --warning: 38 92% 50%;          /* 警告 - 橙色 */
  --success: 142 76% 36%;         /* 成功 - 绿色 */
  --info: 199 89% 48%;           /* 信息 - 蓝色 */
}

[data-theme="dark"] {
  --background: 246 25% 8%;       /* 深色背景 */
  --foreground: 0 0% 95%;         /* 浅色文字 */
  --secondary: 256 73% 25%;       /* 主题色深色版 */
  --muted: 246 15% 15%;          /* 深色静音 */
  --border: 246 15% 20%;         /* 深色边框 */
  --input: 246 15% 12%;          /* 深色输入框 */
}
```

### 色彩变体
```css
/* 主题色变体 */
.primary-50  { background-color: #f8f6ff; }   /* 最浅 */
.primary-100 { background-color: #ede8ff; }
.primary-200 { background-color: #ddd4ff; }
.primary-300 { background-color: #c9b8fe; }
.primary-400 { background-color: #b09df2; }   /* 主题色 */
.primary-500 { background-color: #9a7ff0; }
.primary-600 { background-color: #8659ec; }   /* 深一级 */
.primary-700 { background-color: #7344d8; }
.primary-800 { background-color: #5f38b0; }
.primary-900 { background-color: #4a2c85; }   /* 最深 */

/* 字体色变体 */
.text-primary    { color: #342d4b; }          /* 主要文字 */
.text-secondary  { color: #5a4f6b; }          /* 次要文字 */
.text-muted      { color: #8a7ba8; }          /* 弱化文字 */
.text-disabled   { color: #bab4c9; }          /* 禁用文字 */
```

## 字体系统

### 字体栈
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, 
             "Noto Sans", sans-serif, 
             "Apple Color Emoji", "Segoe UI Emoji", 
             "Segoe UI Symbol", "Noto Color Emoji";
```

### 字体特性
- **系统字体优先**: 使用用户系统原生字体
- **跨平台兼容**: 支持 macOS、Windows、Linux
- **Emoji 支持**: 包含完整 emoji 字体栈
- **字重支持**: 400 (regular), 500 (medium) 等

### 推测字体大小系统
```css
/* Tailwind CSS 默认字体大小 */
text-xs:    0.75rem   /* 12px */
text-sm:    0.875rem  /* 14px */
text-base:  1rem      /* 16px */
text-lg:    1.125rem  /* 18px */
text-xl:    1.25rem   /* 20px */
text-2xl:   1.5rem    /* 24px */
text-3xl:   1.875rem  /* 30px */
text-4xl:   2.25rem   /* 36px */
```

## 布局系统

### Flexbox 架构
```css
.flex           /* display: flex */
.flex-col       /* flex-direction: column */
.flex-1         /* flex: 1 1 0% */
.min-h-screen   /* min-height: 100vh */
```

### 响应式断点
```css
/* Tailwind CSS 默认断点 */
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### 间距系统
```css
/* Tailwind CSS 间距比例 (基于 0.25rem = 4px) */
p-1:  0.25rem    /* 4px */
p-2:  0.5rem     /* 8px */
p-4:  1rem       /* 16px */
p-6:  1.5rem     /* 24px */
p-8:  2rem       /* 32px */
p-12: 3rem       /* 48px */
```

## 组件样式

### 按钮组件
```css
/* 预期按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

.btn-secondary {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
}
```

### 卡片组件
```css
.card {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 导航组件
```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.nav-link {
  color: var(--foreground);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary);
}
```

## 动画与过渡

### 过渡效果
```css
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

### 悬停效果
```css
.hover\\:scale-105:hover {
  transform: scale(1.05);
}

.hover\\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

## 主题切换实现

### JavaScript 主题切换
```javascript
// 主题切换逻辑
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// 系统主题检测
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}
```

## 设计原则

### 设计哲学
- **简约主义**: 干净、最小化的设计
- **功能性**: 优先考虑用户体验
- **一致性**: 统一的设计语言
- **可访问性**: 支持辅助功能

### 视觉层次
- **对比度**: 确保文字可读性
- **留白**: 合理使用空间
- **比例**: 和谐的视觉比例
- **节奏**: 一致的视觉节奏

## 开发建议

### CSS 架构
1. 使用 Tailwind CSS 实用程序类
2. 自定义组件使用 CSS 模块
3. 主题变量使用 CSS 自定义属性
4. 响应式设计优先移动端

### 性能优化
1. CSS 类名按需生成 (PurgeCSS)
2. 关键 CSS 内联
3. 字体优化和预加载
4. 图片优化和延迟加载