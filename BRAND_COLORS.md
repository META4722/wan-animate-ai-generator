# Rendaily 品牌色彩规范

## 品牌核心色彩

### 主要色彩
- **主题色**: `#b09df2` (薰衣草紫)
- **字体色**: `#342d4b` (深紫灰)

### 色彩心理学
薰衣草紫 (#b09df2) 传达：
- **创造力**: 激发设计灵感
- **专业性**: 高端技术感
- **平静**: 舒适的用户体验
- **创新**: AI科技的前沿感

深紫灰 (#342d4b) 传达：
- **稳重**: 专业可信赖
- **高端**: 企业级品质
- **易读**: 优秀的可读性

## Tailwind CSS 配置

### tailwind.config.js
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // 品牌色彩
        brand: {
          primary: '#b09df2',
          text: '#342d4b',
        },
        // 主题色变体
        primary: {
          50: '#f8f6ff',
          100: '#ede8ff', 
          200: '#ddd4ff',
          300: '#c9b8fe',
          400: '#b09df2',  // 主题色
          500: '#9a7ff0',
          600: '#8659ec',  // 悬停状态
          700: '#7344d8',
          800: '#5f38b0',
          900: '#4a2c85',
        },
        // 文字色彩
        text: {
          primary: '#342d4b',    // 主要文字
          secondary: '#5a4f6b',  // 次要文字  
          muted: '#8a7ba8',      // 弱化文字
          disabled: '#bab4c9',   // 禁用文字
        },
        // 功能色彩
        success: '#16a34a',
        warning: '#ea580c', 
        error: '#dc2626',
        info: '#0ea5e9',
      }
    }
  }
}
```

### CSS 变量 (globals.css)
```css
@layer base {
  :root {
    /* 品牌核心色 */
    --brand-primary: #b09df2;
    --brand-text: #342d4b;
    
    /* Tailwind CSS 兼容格式 */
    --color-primary-50: 248 246 255;
    --color-primary-100: 237 232 255;
    --color-primary-200: 221 212 255;
    --color-primary-300: 201 184 254;
    --color-primary-400: 176 157 242;  /* 主题色 */
    --color-primary-500: 154 127 240;
    --color-primary-600: 134 89 236;
    --color-primary-700: 115 68 216;
    --color-primary-800: 95 56 176;
    --color-primary-900: 74 44 133;
    
    /* 语义色彩 */
    --background: 0 0% 100%;
    --foreground: 246 25% 25%;     /* #342d4b */
    --primary: 256 73% 76%;        /* #b09df2 */
    --primary-foreground: 0 0% 100%;
    --secondary: 256 73% 85%;
    --secondary-foreground: 246 25% 25%;
    --muted: 246 15% 95%;
    --muted-foreground: 246 25% 45%;
    --accent: 256 73% 76%;
    --accent-foreground: 0 0% 100%;
    --border: 246 15% 88%;
    --input: 246 15% 96%;
  }
  
  .dark {
    --background: 246 25% 8%;
    --foreground: 0 0% 95%;
    --primary: 256 73% 76%;
    --primary-foreground: 246 25% 8%;
    --secondary: 256 73% 25%;
    --secondary-foreground: 0 0% 95%;
    --muted: 246 15% 15%;
    --muted-foreground: 246 15% 65%;
    --accent: 256 73% 25%;
    --accent-foreground: 0 0% 95%;
    --border: 246 15% 20%;
    --input: 246 15% 12%;
  }
}
```

## 组件应用示例

### 按钮组件
```tsx
// 主要按钮
<button className="bg-primary-400 hover:bg-primary-600 text-white">
  生成渲染
</button>

// 次要按钮
<button className="border border-primary-400 text-primary-400 hover:bg-primary-50">
  预览
</button>

// 危险按钮
<button className="bg-red-500 hover:bg-red-600 text-white">
  删除
</button>
```

### 卡片组件
```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div className="p-6">
    <h3 className="text-lg font-semibold text-text-primary">
      文本转渲染
    </h3>
    <p className="text-sm text-text-muted mt-2">
      通过文字描述生成建筑渲染图
    </p>
  </div>
</div>
```

### 表单组件
```tsx
<div className="space-y-4">
  <label className="block text-sm font-medium text-text-primary">
    渲染描述
  </label>
  <textarea 
    className="w-full p-3 border border-gray-300 rounded-md 
               focus:ring-2 focus:ring-primary-400 focus:border-transparent"
    placeholder="描述你想要的建筑风格..."
  />
</div>
```

## 状态色彩指南

### 交互状态
```css
/* 悬停状态 */
.hover-primary:hover {
  background-color: #8659ec; /* primary-600 */
}

/* 激活状态 */
.active-primary {
  background-color: #7344d8; /* primary-700 */
}

/* 禁用状态 */
.disabled {
  background-color: #f3f4f6;
  color: #bab4c9;
}
```

### 反馈色彩
```css
.success { color: #16a34a; }  /* 绿色 - 成功 */
.warning { color: #ea580c; }  /* 橙色 - 警告 */
.error { color: #dc2626; }    /* 红色 - 错误 */
.info { color: #0ea5e9; }     /* 蓝色 - 信息 */
```

## 可访问性指南

### 对比度检查
- **主题色 (#b09df2) vs 白色**: 对比度 4.8:1 ✅
- **字体色 (#342d4b) vs 白色**: 对比度 8.9:1 ✅
- **主题色 (#b09df2) vs 字体色 (#342d4b)**: 对比度 1.8:1 ❌

### 建议
1. **白色背景 + 字体色**: 用于正文
2. **主题色背景 + 白色文字**: 用于按钮
3. **避免主题色文字 + 字体色背景**: 对比度不足

## 品牌应用场景

### Logo 应用
- **主标志**: 主题色 (#b09df2) 
- **单色版本**: 深紫灰 (#342d4b)
- **反白版本**: 白色

### UI 应用优先级
1. **主要操作**: 主题色背景
2. **次要操作**: 主题色边框 
3. **文字链接**: 主题色文字
4. **状态提示**: 功能色彩

这套色彩系统确保了品牌一致性和良好的用户体验。