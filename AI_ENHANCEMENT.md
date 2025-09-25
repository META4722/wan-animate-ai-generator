# AI Scene Description Enhancement

## 功能说明

在Scene Description文本框中新增了"AI Enhance"按钮，可以使用OpenRouter的deepseek-chat-v3.1模型来自动优化用户的场景描述，使其更适合AI图像生成。

## 如何使用

1. 在Scene Description文本框中输入基本描述，如："现代客厅"
2. 点击右上角的"AI Enhance"按钮
3. AI会自动将描述优化为详细的专业提示词，如："Professional interior design rendering of a modern living room, featuring clean lines, minimalist furniture, neutral color palette with accent colors, floor-to-ceiling windows with natural lighting, hardwood floors, contemporary art pieces, high-end materials, architectural photography style, photorealistic quality"

## API 配置

需要在环境变量中配置：

```bash
OPENROUTER_API_KEY=your-openrouter-api-key
```

## API调用示例

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "deepseek/deepseek-chat-v3.1:free",
    "messages": [
      {
        "role": "user",
        "content": "Transform this description for AI image generation: modern living room"
      }
    ]
  }'
```

## 特点

- 根据不同的设计类型(Text to Render, Sketch to Render等)提供针对性的优化
- 包含建筑细节、材料、灯光、构图等专业要素
- 限制在200词以内，保持简洁
- 包含错误处理和降级方案
- 美观的UI设计，带有加载状态和渐变按钮

## 错误处理

- 如果API调用失败，会显示友好的错误信息
- 提供基本的降级增强功能
- 空输入时会提示用户先输入描述