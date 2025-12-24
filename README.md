# Infographic Gallery

基于 [@antv/infographic](https://github.com/antvis/Infographic) 的信息图展示与编辑工具。

## 功能

- **Gallery 展示**：展示全部 212+ 个内置模板
- **分类筛选**：7 个分类（对比、列表、流程、象限、层级、关系、图表）
- **主题切换**：light / dark / hand-drawn
- **Playground 编辑**：JSON 配置实时预览
- **导出功能**：
  - SVG：源码查看、复制、下载
  - PNG：复制到剪贴板、下载
- **AI 提示词**：一键复制到 ChatGPT/Claude 生成配置

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 Cloudflare Pages

```bash
# 首次部署
npm run deploy

# 本地预览 Pages 环境
npm run pages:dev
```

或通过 Cloudflare Dashboard：
1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 输出目录：`dist`

## 技术栈

- React 19
- TypeScript
- Vite 7
- TailwindCSS 4
- @antv/infographic
- Lucide Icons
