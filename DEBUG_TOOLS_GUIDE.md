# 🔧 Video Generation Debug Tools Guide

## 概述

我为你创建了一套完整的调试工具来监控视频生成的每个步骤，帮你快速定位问题所在。

---

## 🚀 快速开始

### 1. 后端诊断工具
运行完整的系统诊断：
```bash
npm run diagnostic
```

这会检查：
- ✅ 用户账户和积分
- ✅ 数据库表连接性
- ✅ API端点状态
- ✅ 数据库写入测试
- ✅ 最近的活动记录

### 2. 实时监控工具
开始实时监控视频生成过程：
```bash
npm run monitor
```

这会实时显示：
- 💰 积分变化（生成开始时会扣除积分）
- 📊 数据库记录增加
- 🎥 新视频保存通知
- ⏱️ 完整的时间线追踪

### 3. 前端调试工具
在浏览器中，按F12打开控制台，复制粘贴以下文件内容：
```javascript
// 复制 scripts/frontend-debug.js 的内容到浏览器控制台
```

前端工具提供：
- 🕵️ API调用拦截和记录
- 📱 表单数据检查
- 🔐 认证状态检查
- 📺 视频元素监控
- 🎯 可视化指示器

---

## 📋 详细使用说明

### 后端诊断 (`npm run diagnostic`)

**什么时候使用：**
- 视频生成前，确保所有系统正常
- 出现问题时，快速定位故障点
- 定期健康检查

**输出解读：**
```
✅ Green = 正常工作
⚠️  Warning = 有问题但不致命
❌ Red = 严重问题需要修复
ℹ️  Info = 信息性消息
```

**常见问题：**
- `HTTP 401`: 正常，API需要认证
- `Table not accessible`: 数据库连接问题
- `Foreign key constraint`: 测试数据问题（可忽略）

### 实时监控 (`npm run monitor`)

**使用流程：**
1. 在终端运行 `npm run monitor`
2. 打开浏览器，登录你的账户
3. 开始生成视频
4. 观察终端中的实时更新

**监控信息：**
- 💸 积分扣除 = 视频生成开始
- 📊 数据库记录增加 = 视频保存成功
- 🎉 视频URL显示 = 完整成功

**停止监控：**
按 `Ctrl+C`

### 前端调试工具

**安装方法：**
1. 在网站上按F12打开开发者工具
2. 切换到"Console"标签
3. 复制`scripts/frontend-debug.js`文件内容
4. 粘贴到控制台并按回车

**可用命令：**
```javascript
// 检查表单数据
videoDebugger.checkFormData()

// 检查认证状态
videoDebugger.checkAuth()

// 测试API端点
videoDebugger.testAPIs()

// 显示所有日志
videoDebugger.showLogs()

// 导出日志为文件
videoDebugger.exportLogs()

// 清除日志
videoDebugger.clearLogs()
```

**可视化功能：**
- 右上角弹出通知显示API调用状态
- 左下角调试面板提供快捷操作
- 自动监控表单提交和视频元素

---

## 🐛 常见问题诊断

### 问题 1: 积分被扣但视频不见了
**诊断步骤：**
1. `npm run monitor` - 检查数据库是否保存记录
2. 检查前端控制台是否有API错误
3. 查看视频生成API是否返回了URL

**可能原因：**
- API成功但前端显示失败
- 数据库保存失败
- 网络中断

### 问题 2: 生成按钮点击无反应
**诊断步骤：**
1. 使用前端调试工具检查表单数据
2. `videoDebugger.checkAuth()` 检查认证
3. 查看控制台API调用日志

**可能原因：**
- 表单验证失败
- 用户未登录
- 积分不足

### 问题 3: API返回500错误
**诊断步骤：**
1. `npm run diagnostic` 检查数据库连接
2. 查看服务器日志错误详情
3. 检查Supabase表是否存在

**可能原因：**
- 数据库表不存在
- 权限配置错误
- 服务器内部错误

### 问题 4: 视频生成很慢或卡住
**监控方法：**
1. `npm run monitor` 实时追踪进度
2. 观察API调用时间和响应
3. 检查fal.ai服务状态

---

## 📊 日志和调试信息

### 保存诊断结果
```bash
# 保存诊断结果到文件
npm run diagnostic > diagnosis.txt 2>&1

# 保存监控日志
npm run monitor > monitor.log 2>&1
```

### 前端日志导出
在浏览器控制台运行：
```javascript
videoDebugger.exportLogs()  // 下载JSON格式日志
```

### 服务器日志位置
开发模式下，服务器日志直接显示在运行`npm run dev`的终端中。

---

## 🎯 最佳实践

### 在生成视频前：
1. 运行 `npm run diagnostic` 确保系统健康
2. 检查积分余额是否足够
3. 确保已登录状态

### 在生成视频时：
1. 打开 `npm run monitor` 监控过程
2. 在浏览器开启前端调试工具
3. 保持网络连接稳定

### 遇到问题时：
1. 记录具体的错误信息和时间
2. 导出前端和后端日志
3. 运行完整诊断检查系统状态

---

## 🔧 工具文件说明

| 文件 | 用途 | 运行方式 |
|------|------|----------|
| `debug-video-generation.js` | 系统诊断 | `npm run diagnostic` |
| `realtime-video-monitor.js` | 实时监控 | `npm run monitor` |
| `frontend-debug.js` | 前端调试 | 浏览器控制台 |

---

## 🆘 获取帮助

如果工具本身出现问题：
1. 检查Node.js版本（需要>=16）
2. 确保`.env.local`文件配置正确
3. 重新安装依赖：`npm install`
4. 重启开发服务器：`npm run dev`

这套工具应该能帮你快速定位视频生成过程中的任何问题！🎉