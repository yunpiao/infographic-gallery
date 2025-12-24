# Infographic Gallery - Claude Instructions

## Project Summary

这是一个基于 @antv/infographic 的信息图展示和编辑工具，部署在 Cloudflare Pages。

## Key Commands

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run deploy   # 部署到 Cloudflare Pages
```

## Architecture

- **Gallery** (`InfographicGallery.tsx`): 展示 212+ 模板，按 7 个分类筛选
- **Playground** (`InfographicPlayground.tsx`): 编辑器，支持 JSON 和语法两种输入模式

## Critical APIs

```typescript
// 获取所有模板
import { getTemplates } from '@antv/infographic';
const templates = getTemplates(); // string[]

// 解析文本语法
import { parseSyntax } from '@antv/infographic';
const result = parseSyntax(syntaxText);
// result.options: InfographicOptions
// result.errors: ParseError[]

// 创建信息图
const infographic = new Infographic({
  container: '#id',
  template: 'list-row-simple',
  theme: 'light', // 'light' | 'dark' | 'hand-drawn'
  data: { title: '...', items: [...] },
});
infographic.render();

// 导出
await infographic.toDataURL({ type: 'png' }); // 或 'svg'
```

## Themes

仅支持 3 个内置主题：
- `light` - 默认浅色
- `dark` - 深色背景
- `hand-drawn` - 手绘风格（需加载 851tegakizatsu 字体）

## Common Patterns

### 添加新分类
1. 更新 `categorizeTemplates()` 中的分类逻辑
2. 在 `CATEGORIES` 数组添加分类信息
3. 更新 `CategoryKey` 类型

### 添加新导出格式
1. 在 `InfographicPlayground.tsx` 添加处理函数
2. 添加 UI 按钮
3. 使用 `instanceRef.current.toDataURL()` 或 `getSvgString()`

## Don't

- 不要使用不存在的模板名称，用 `getTemplates()` 验证
- 不要假设主题名称，只有 light/dark/hand-drawn
- 不要在 SSR 环境使用（依赖 DOM API）
