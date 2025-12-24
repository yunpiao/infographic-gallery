# Project Context

## 1. Overview

- **摘要**：基于 @antv/infographic 的信息图 Gallery 与 Playground 工具
- **领域**：Web Frontend / Visualization Tool
- **核心价值**：
  - 展示 212+ 内置信息图模板
  - 支持 JSON 配置和 Infographic 文本语法两种输入模式
  - SVG/PNG 导出，AI 提示词辅助生成

## 2. Tech Stack

- **Language/Runtime**：TypeScript 5.8 / React 19
- **Frameworks**：Vite 7 + React
- **UI**：TailwindCSS 4 + Lucide Icons
- **Visualization**：@antv/infographic 0.1.4
- **Deployment**：Cloudflare Pages

## 3. Structure

```
📂 src/
├── 📄 main.tsx              # 应用入口
├── 📄 App.tsx               # 根组件，页面路由
├── 📂 components/
│   ├── InfographicGallery.tsx   # 模板展示页
│   └── InfographicPlayground.tsx # 编辑器页面
└── 📂 lib/
    └── utils.ts             # 工具函数 (cn)
```

## 4. Development

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run deploy   # 部署到 Cloudflare Pages
```

## 5. Key Features

| 功能 | 实现 |
|------|------|
| 模板展示 | `getTemplates()` 动态获取所有模板 |
| 分类筛选 | 7 个分类：对比/列表/流程/象限/层级/关系/图表 |
| 主题切换 | light / dark / hand-drawn |
| JSON 输入 | 直接解析 JSON 配置 |
| 语法输入 | `parseSyntax()` 解析 Infographic 语法 |
| SVG 导出 | `XMLSerializer` 序列化 SVG |
| PNG 导出 | `infographic.toDataURL({ type: 'png' })` |
| AI 提示词 | 内置系统提示词，一键复制 |

## 6. AI Behavior Rules

### Must Do
- [ ] 使用 `@/` 路径别名
- [ ] 新增模板分类需更新 `categorizeTemplates()`
- [ ] 修改语法解析需验证 `parseSyntax()` 返回结构

### Must NOT Do
- [ ] 不要硬编码模板列表，使用 `getTemplates()`
- [ ] 不要在组件外调用 `document.getElementById`

### Prefer
- [ ] 优先使用 `useMemo` 缓存计算
- [ ] 优先使用 `useCallback` 包装事件处理函数

## 7. Deployment

### Cloudflare Pages 自动部署
- **构建命令**：`npm run build`
- **输出目录**：`dist`
- **分支**：`main`

### 手动部署
```bash
npm run deploy
```
