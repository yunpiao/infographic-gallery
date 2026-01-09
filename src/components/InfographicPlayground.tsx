import { useEffect, useRef, useState, useCallback } from 'react';
import { Infographic, getTemplates, parseSyntax, type InfographicOptions } from '@antv/infographic';
import {
  LayoutDashboard,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Code,
  Sparkles,
  FileImage,
  ClipboardCopy,
  X,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui';

interface PlaygroundProps {
  onBack: () => void;
  initialConfig?: InfographicOptions;
  initialTheme?: string;
}

const AVAILABLE_TEMPLATES = getTemplates();

// 将 InfographicOptions 转换为 syntax 格式
function configToSyntax(config: InfographicOptions, theme: string = 'light'): string {
  const lines: string[] = [];

  lines.push(`infographic ${config.template}`);
  lines.push('data');

  if (config.data) {
    if (config.data.title) {
      lines.push(`  title ${config.data.title}`);
    }
    if (config.data.desc) {
      lines.push(`  desc ${config.data.desc}`);
    }
    if (config.data.items && Array.isArray(config.data.items)) {
      lines.push('  items');
      for (const item of config.data.items) {
        lines.push(`    - label ${item.label || ''}`);
        if (item.desc) lines.push(`      desc ${item.desc}`);
        if (item.value !== undefined) lines.push(`      value ${item.value}`);
        if (item.icon) lines.push(`      icon ${item.icon}`);
        // 处理 children（如 SWOT）
        if (item.children && Array.isArray(item.children)) {
          lines.push('      children');
          for (const child of item.children) {
            lines.push(`        - label ${child.label || ''}`);
            if (child.desc) lines.push(`          desc ${child.desc}`);
            if (child.value !== undefined) lines.push(`          value ${child.value}`);
          }
        }
      }
    }
  }

  lines.push('theme');
  lines.push(`  type ${theme}`);

  return lines.join('\n');
}

const DEFAULT_CONFIG: InfographicOptions = {
  width: 600,
  height: 400,
  template: 'list-row-simple-horizontal-arrow',
  data: {
    title: '项目流程',
    items: [
      { label: '需求分析', desc: '明确目标' },
      { label: '方案设计', desc: '架构规划' },
      { label: '开发实现', desc: '编码测试' },
      { label: '上线部署', desc: '交付运维' },
    ],
  },
};

const EXAMPLE_CONFIGS: { name: string; config: InfographicOptions }[] = [
  {
    name: '流程图',
    config: DEFAULT_CONFIG,
  },
  {
    name: 'SWOT 分析',
    config: {
      width: 600,
      height: 450,
      template: 'compare-swot',
      data: {
        title: 'SWOT 战略分析',
        items: [
          { label: 'Strengths', children: [{ label: '技术领先' }, { label: '品牌优势' }] },
          { label: 'Weaknesses', children: [{ label: '成本较高' }, { label: '覆盖有限' }] },
          { label: 'Opportunities', children: [{ label: '市场增长' }, { label: '政策利好' }] },
          { label: 'Threats', children: [{ label: '竞争加剧' }, { label: '技术变革' }] },
        ],
      },
    },
  },
  {
    name: '时间线',
    config: {
      width: 600,
      height: 400,
      template: 'sequence-timeline-simple',
      data: {
        title: '发展历程',
        items: [
          { label: '2020', desc: '公司成立' },
          { label: '2021', desc: 'A轮融资' },
          { label: '2022', desc: '用户百万' },
          { label: '2023', desc: '海外拓展' },
        ],
      },
    },
  },
  {
    name: '四象限',
    config: {
      width: 600,
      height: 500,
      template: 'quadrant-quarter-circular',
      data: {
        title: '时间管理矩阵',
        items: [
          { label: '紧急且重要', desc: '立即处理' },
          { label: '重要不紧急', desc: '计划安排' },
          { label: '紧急不重要', desc: '委托他人' },
          { label: '不紧急不重要', desc: '适时处理' },
        ],
      },
    },
  },
  {
    name: '柱状图',
    config: {
      width: 600,
      height: 400,
      template: 'chart-column-simple',
      data: {
        title: '月度销售额',
        items: [
          { label: '1月', value: 120 },
          { label: '2月', value: 150 },
          { label: '3月', value: 180 },
          { label: '4月', value: 200 },
          { label: '5月', value: 220 },
          { label: '6月', value: 250 },
        ],
      },
    },
  },
];

const THEMES = ['light', 'dark', 'hand-drawn'];
// @antv/infographic 0.2.x only supports 'rough' stylize
const STYLIZE_OPTIONS = ['none', 'rough'] as const;
type StylizeType = typeof STYLIZE_OPTIONS[number];

// 语法骨架作为 placeholder
const SYNTAX_PLACEHOLDER = `# 语法骨架示例
infographic <模板名>
data
  title 标题
  desc 描述（可选）
  items
    - label 项目名
      desc 说明
      icon mdi/图标名
      value 数值（图表类用）
      children（层级用）
        - label 子项
theme
  palette #3b82f6 #10b981

# 可用字段：label, desc, value, icon, children
# value 只能是数字，不能是字符串！`;

const AI_SYSTEM_PROMPT = `## 角色

你是 AntV Infographic DSL 编译器，将自然语言转换为信息图语法代码。

---

## 输出规则（最高优先级）

1. **仅输出** \`\`\`plain 代码块，禁止任何解释性文字
2. **缩进** 2个空格，禁用 Tab
3. **首行格式** \`infographic <template-name>\`
4. **语言一致** 输出语言必须与用户输入语言一致

---

## 字段白名单（严格遵守）

items 内**仅允许**以下 6 个字段，禁止臆造其他字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | String | ✅ | 标题/名称 |
| desc | String | - | 描述/副标题 |
| value | Number | - | **仅限数字**（用于图表类模板） |
| icon | String | - | 图标名（格式 \`mdi/<name>\`） |
| illus | String | - | 插图名（unDraw 插图，如 \`coding\`） |
| children | Array | - | 子节点（用于层级/对比结构） |

### ⚠️ 禁止事项

- ❌ \`value status\` → value 只能是数字如 \`value 100\`
- ❌ \`status 完成\` → status 字段不存在
- ❌ \`color #ff0000\` → color 字段不存在，颜色用 theme.palette
- ❌ \`id 1\` / \`type xxx\` → 这些字段都不存在

---

## 图标与插图资源

**图标 (Iconify)**:
- 格式: \`<collection>/<icon-name>\`，如 \`mdi/rocket-launch\`
- 常用集合: \`mdi/*\`(Material Design), \`fa/*\`(Font Awesome), \`bi/*\`(Bootstrap)
- 示例: \`mdi/code-tags\`, \`mdi/database\`, \`mdi/chart-line\`, \`mdi/account-group\`

**插图 (unDraw)**:
- 格式: 插图文件名（无.svg），如 \`coding\`, \`team-work\`, \`analytics\`
- 适用于 \`*-illus\` 模板（如 \`sequence-timeline-simple-illus\`）

---

## 主题配置

\`\`\`plain
theme dark              # 可选: light(默认), dark, hand-drawn
  palette
    - #61DDAA
    - #F6BD16
    - #F08BB4
  stylize rough         # 可选: rough(手绘风格)
  base
    text
      font-family 851tegakizatsu  # 手绘风格字体
\`\`\`

---

## 模板决策树

\`\`\`
数据结构是什么？
│
├─ 有先后顺序？ → 流程类
│   ├─ 闭环循环 → sequence-circular-simple
│   ├─ 漏斗筛选 → sequence-funnel-simple ⭐新
│   ├─ 金字塔   → sequence-pyramid-simple
│   ├─ 阶梯递进 → sequence-ascending-steps
│   ├─ 时间线   → sequence-timeline-simple / sequence-roadmap-vertical-simple
│   ├─ 蛇形步骤 → sequence-snake-steps-simple
│   └─ 线性步骤 → sequence-zigzag-steps-underline-text
│
├─ 有父子层级？ → 层级类
│   ├─ 技术架构 → hierarchy-tree-tech-style-capsule-item
│   ├─ 组织结构 → hierarchy-tree-curved-line-rounded-rect-node
│   └─ 层级结构 → hierarchy-structure
│
├─ 是 A vs B？ → 对比类
│   ├─ SWOT分析 → compare-swot
│   ├─ 四象限   → quadrant-quarter-simple-card / quadrant-quarter-circular
│   └─ 二元对比 → compare-binary-horizontal-simple-fold
│
├─ 有数值统计？ → 图表类（value 必填且为数字）
│   ├─ 占比分布 → chart-pie-donut-pill-badge
│   ├─ 趋势变化 → chart-line-plain-text
│   ├─ 柱状对比 → chart-column-simple
│   └─ 词云     → chart-wordcloud
│
├─ 关系展示？ → 关系类
│   └─ 圆形关系 → relation-circle-icon-badge
│
└─ 平铺枚举？ → 列表类
    ├─ 有推导关系 → list-row-horizontal-icon-arrow
    ├─ 卡片展示   → list-grid-badge-card / list-grid-candy-card-lite
    ├─ 扇形发散   → list-sector-plain-text
    └─ 待办列表   → list-column-done-list
\`\`\`

---

## 完整模板列表

**流程 (sequence-*)**:
sequence-zigzag-steps-underline-text, sequence-horizontal-zigzag-underline-text, sequence-horizontal-zigzag-simple-illus, sequence-circular-simple, sequence-filter-mesh-simple, sequence-mountain-underline-text, sequence-cylinders-3d-simple, sequence-color-snake-steps-horizontal-icon-line, sequence-pyramid-simple, sequence-funnel-simple, sequence-roadmap-vertical-simple, sequence-roadmap-vertical-plain-text, sequence-zigzag-pucks-3d-simple, sequence-ascending-steps, sequence-ascending-stairs-3d-underline-text, sequence-snake-steps-compact-card, sequence-snake-steps-underline-text, sequence-snake-steps-simple, sequence-stairs-front-compact-card, sequence-stairs-front-pill-badge, sequence-timeline-simple, sequence-timeline-rounded-rect-node, sequence-timeline-simple-illus

**对比 (compare-*)**:
compare-binary-horizontal-simple-fold, compare-hierarchy-left-right-circle-node-pill-badge, compare-swot, compare-binary-horizontal-badge-card-arrow, compare-binary-horizontal-underline-text-vs

**象限 (quadrant-*)**:
quadrant-quarter-simple-card, quadrant-quarter-circular, quadrant-simple-illus

**关系 (relation-*)**:
relation-circle-icon-badge, relation-circle-circular-progress

**层级 (hierarchy-*)**:
hierarchy-tree-tech-style-capsule-item, hierarchy-tree-curved-line-rounded-rect-node, hierarchy-tree-tech-style-badge-card, hierarchy-structure

**图表 (chart-*)**:
chart-column-simple, chart-bar-plain-text, chart-line-plain-text, chart-pie-plain-text, chart-pie-compact-card, chart-pie-donut-plain-text, chart-pie-donut-pill-badge, chart-wordcloud

**列表 (list-*)**:
list-grid-badge-card, list-grid-candy-card-lite, list-grid-ribbon-card, list-row-horizontal-icon-arrow, list-row-simple-illus, list-sector-plain-text, list-column-done-list, list-column-vertical-icon-arrow, list-column-simple-vertical-arrow, list-zigzag-down-compact-card, list-zigzag-down-simple, list-zigzag-up-compact-card, list-zigzag-up-simple

---

## 正确示例

### 流程图（带图标）
\`\`\`plain
infographic sequence-zigzag-steps-underline-text
data
  title 用户注册流程
  items
    - label 输入手机号
      desc 填写11位号码
      icon mdi/cellphone
    - label 验证码校验
      desc 输入短信验证码
      icon mdi/message
    - label 注册完成
      icon mdi/check-circle
\`\`\`

### 图表（value 必须是数字）
\`\`\`plain
infographic chart-column-simple
data
  title Q3 销售额
  desc 单位：万元
  items
    - label 北京
      value 320
    - label 上海
      value 280
    - label 广州
      value 195
\`\`\`

### 对比（使用 children）
\`\`\`plain
infographic compare-swot
data
  title SWOT 战略分析
  items
    - label Strengths
      children
        - label 技术领先
        - label 品牌优势
    - label Weaknesses
      children
        - label 成本较高
        - label 覆盖有限
    - label Opportunities
      children
        - label 市场增长
        - label 政策利好
    - label Threats
      children
        - label 竞争加剧
        - label 技术变革
\`\`\`

### 带插图的时间线
\`\`\`plain
infographic sequence-timeline-simple-illus
data
  title 产品开发阶段
  items
    - label 调研
      desc 了解用户需求
      illus user-research
    - label 设计
      desc 创建用户体验
      illus design-thinking
    - label 开发
      desc 构建产品
      illus coding
    - label 发布
      desc 推向市场
      illus launch-day
\`\`\`

### 深色主题 + 自定义配色
\`\`\`plain
infographic list-row-horizontal-icon-arrow
theme dark
  palette
    - #61DDAA
    - #F6BD16
    - #F08BB4
data
  title 工作流程
  items
    - label 步骤一
      desc 开始
    - label 步骤二
      desc 进行中
    - label 步骤三
      desc 完成
\`\`\`

---

## 错误示例（禁止模仿）

\`\`\`plain
# ❌ 错误：value 使用了字符串
- label 报错字段
  value status        # 错误！value 只能是数字

# ❌ 错误：使用了不存在的字段
- label 任务
  status 完成         # 错误！status 字段不存在
  priority high       # 错误！priority 字段不存在

# ✅ 正确：只用白名单字段
- label 任务
  desc 已完成
  icon mdi/check
\`\`\`
`;

type InputMode = 'json' | 'syntax';

const DEFAULT_SYNTAX = `infographic list-row-horizontal-icon-arrow
data
  title 项目流程
  desc 完整的项目管理流程
  items
    - label 规划阶段
      desc 需求分析和计划制定
      value 1
    - label 设计阶段
      desc 架构设计和原型制作
      value 2
    - label 开发阶段
      desc 功能实现和测试
      value 3
    - label 发布阶段
      desc 部署上线和维护
      value 4
theme
  type light
`;

export function InfographicPlayground({ onBack, initialConfig, initialTheme }: PlaygroundProps) {
  // 默认使用语法模式
  const [inputMode, setInputMode] = useState<InputMode>('syntax');
  const [jsonText, setJsonText] = useState(JSON.stringify(initialConfig || DEFAULT_CONFIG, null, 2));
  const [syntaxText, setSyntaxText] = useState(() =>
    initialConfig
      ? configToSyntax(initialConfig, initialTheme || 'light')
      : DEFAULT_SYNTAX
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'light');
  const [selectedStylize, setSelectedStylize] = useState<StylizeType>('none');
  const [copied, setCopied] = useState(false);
  const [svgCopied, setSvgCopied] = useState(false);
  const [showSvgSource, setShowSvgSource] = useState(false);
  const [svgSource, setSvgSource] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

  const [containerId] = useState(() => `playground-${Math.random().toString(36).slice(2)}`);
  const instanceRef = useRef<Infographic | null>(null);

  const renderInfographic = useCallback((config: InfographicOptions, theme: string, stylize: StylizeType) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (instanceRef.current) {
      instanceRef.current.destroy?.();
      instanceRef.current = null;
    }
    setRenderError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        container: `#${containerId}`,
        width: config.width || 600,
        height: config.height || 400,
        template: config.template,
        theme,
        data: config.data,
        editable: true,
      };

      // Add stylize option if not 'none' (only 'rough' is supported in 0.2.x)
      if (stylize !== 'none') {
        options.stylize = stylize;
      }

      const instance = new Infographic(options);

      instance.on('error', (err: Error | Error[]) => {
        const msg = Array.isArray(err) ? err.map(e => e.message).join('; ') : err.message;
        setRenderError(msg);
      });

      instance.render();
      instanceRef.current = instance;
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [containerId]);

  const handleRender = useCallback(() => {
    setParseError(null);
    try {
      let config: InfographicOptions;

      if (inputMode === 'syntax') {
        const result = parseSyntax(syntaxText);
        if (result.errors && result.errors.length > 0) {
          setParseError(result.errors.map(e => e.message).join('; '));
          return;
        }
        config = result.options as InfographicOptions;
      } else {
        config = JSON.parse(jsonText) as InfographicOptions;
      }

      renderInfographic(config, selectedTheme, selectedStylize);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : '解析失败');
    }
  }, [jsonText, syntaxText, inputMode, selectedTheme, selectedStylize, renderInfographic]);

  const handleReset = useCallback(() => {
    setJsonText(JSON.stringify(DEFAULT_CONFIG, null, 2));
    setParseError(null);
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jsonText]);

  const handleExampleSelect = useCallback((config: InfographicOptions) => {
    if (inputMode === 'json') {
      setJsonText(JSON.stringify(config, null, 2));
    } else {
      setSyntaxText(configToSyntax(config, selectedTheme));
    }
    setParseError(null);
  }, [inputMode, selectedTheme]);

  const getSvgElement = useCallback(() => {
    const container = document.getElementById(containerId);
    return container?.querySelector('svg');
  }, [containerId]);

  const getSvgString = useCallback(() => {
    const svg = getSvgElement();
    if (!svg) return '';
    return new XMLSerializer().serializeToString(svg);
  }, [getSvgElement]);

  const handleCopySvg = useCallback(async () => {
    const svgStr = getSvgString();
    if (!svgStr) return;
    await navigator.clipboard.writeText(svgStr);
    setSvgCopied(true);
    setTimeout(() => setSvgCopied(false), 2000);
  }, [getSvgString]);

  const handleDownloadSvg = useCallback(() => {
    const svgStr = getSvgString();
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infographic.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [getSvgString]);

  const handleDownloadPng = useCallback(async () => {
    if (!instanceRef.current) return;
    try {
      const dataUrl = await instanceRef.current.toDataURL({ type: 'png' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'infographic.png';
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }, []);

  const handleCopyPng = useCallback(async () => {
    if (!instanceRef.current) return;
    try {
      const dataUrl = await instanceRef.current.toDataURL({ type: 'png' });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (err) {
      console.error('PNG copy failed:', err);
    }
  }, []);

  const handleViewSvgSource = useCallback(() => {
    const svgStr = getSvgString();
    setSvgSource(svgStr);
    setShowSvgSource(true);
  }, [getSvgString]);

  const handleCopyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(AI_SYSTEM_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }, []);

  // 实时渲染：输入变化或主题变化时自动渲染
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRender();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonText, syntaxText, inputMode, selectedTheme, selectedStylize]);

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy?.();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft size={18} />
              返回
            </Button>
            <div className="h-6 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-bg rounded-lg">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-display text-[var(--foreground)]">
                Infographic <span className="gradient-text">Playground</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPrompt(true)}
              className="gap-2"
            >
              <Sparkles size={16} />
              AI 提示词
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">主题</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="h-9 px-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] focus-ring transition-all hover:border-[var(--accent)]/30"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">风格</span>
              <select
                value={selectedStylize}
                onChange={(e) => setSelectedStylize(e.target.value as StylizeType)}
                className="h-9 px-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] focus-ring transition-all hover:border-[var(--accent)]/30"
              >
                {STYLIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt === 'none' ? '无' : opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Example Buttons */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge variant="muted">示例模板</Badge>
          {EXAMPLE_CONFIGS.map((example) => (
            <button
              key={example.name}
              onClick={() => handleExampleSelect(example.config)}
              className="px-4 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]/30 hover:shadow-sm transition-all"
            >
              {example.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-220px)]">
          {/* Editor Panel */}
          <Card className="flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputMode('json')}
                  className={cn(
                    "px-4 py-1.5 text-sm rounded-lg transition-all font-medium",
                    inputMode === 'json'
                      ? "gradient-bg text-white shadow-sm"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  JSON
                </button>
                <button
                  onClick={() => setInputMode('syntax')}
                  className={cn(
                    "px-4 py-1.5 text-sm rounded-lg transition-all font-medium",
                    inputMode === 'syntax'
                      ? "gradient-bg text-white shadow-sm"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  语法
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSyntaxHelp(true)}
                  title="语法帮助"
                  className="ml-1"
                >
                  <HelpCircle size={16} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  title="复制"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  title="重置"
                >
                  <RotateCcw size={16} />
                </Button>
                <Button
                  size="sm"
                  onClick={handleRender}
                  className="gap-1.5"
                >
                  <Play size={14} />
                  渲染
                </Button>
              </div>
            </CardHeader>
            <div className="flex-1 relative">
              <textarea
                value={inputMode === 'json' ? jsonText : syntaxText}
                onChange={(e) => inputMode === 'json' ? setJsonText(e.target.value) : setSyntaxText(e.target.value)}
                className={cn(
                  "w-full h-full p-5 font-mono text-sm resize-none focus:outline-none bg-transparent",
                  parseError && "border-2 border-red-300 rounded-lg"
                )}
                placeholder={inputMode === 'json' ? '输入 JSON 配置...' : SYNTAX_PLACEHOLDER}
                spellCheck={false}
              />
              {parseError && (
                <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-red-50 text-red-600 text-sm border-t border-red-200">
                  {parseError}
                </div>
              )}
            </div>
            <div className="px-5 py-2.5 border-t border-[var(--border)] bg-[var(--muted)]/30">
              <span className="text-xs text-[var(--muted-foreground)] font-mono">
                可用模板: {AVAILABLE_TEMPLATES.length} 个
              </span>
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--foreground)]">预览</h3>
                <Badge variant="accent" className="text-[10px] py-0.5 px-2">可编辑</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto relative">
              <div
                id={containerId}
                className="w-full h-full flex items-center justify-center"
              />
              {renderError && (
                <div className="absolute inset-4 flex items-center justify-center bg-red-50 text-red-600 text-sm rounded-xl p-4 text-center">
                  {renderError}
                </div>
              )}
            </CardContent>
            {/* Export Toolbar */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">导出</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleViewSvgSource}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors group relative"
                  title="查看 SVG 源码"
                >
                  <Code size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                </button>
                <button
                  onClick={handleCopySvg}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors group relative"
                  title="复制 SVG"
                >
                  <Copy size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors group relative"
                  title="下载 SVG"
                >
                  <Download size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                </button>
                <div className="w-px h-4 bg-[var(--border)] mx-1" />
                <button
                  onClick={handleCopyPng}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors group relative"
                  title="复制 PNG"
                >
                  <ClipboardCopy size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                </button>
                <button
                  onClick={handleDownloadPng}
                  className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors group relative"
                  title="下载 PNG"
                >
                  <FileImage size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* SVG Source Modal */}
      {showSvgSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSvgSource(false)}>
          <Card className="max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">SVG 源码</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(svgSource);
                    setSvgCopied(true);
                    setTimeout(() => setSvgCopied(false), 2000);
                  }}
                >
                  {svgCopied ? '已复制' : '复制'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSvgSource(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <pre className="text-xs font-mono text-[var(--muted-foreground)] whitespace-pre-wrap break-all bg-[var(--muted)] p-4 rounded-lg">
                {svgSource}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPrompt(false)}>
          <Card className="max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)]">AI 信息图生成提示词</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCopyPrompt}
                >
                  {promptCopied ? '已复制' : '复制提示词'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrompt(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="mb-4 p-4 gradient-bg rounded-xl text-white text-sm">
                💡 将此提示词复制到 ChatGPT、Claude 或其他 AI 工具中，然后描述你想要的信息图内容，AI 会生成 Infographic 语法代码。
              </div>
              <pre className="text-xs font-mono text-[var(--muted-foreground)] whitespace-pre-wrap bg-[var(--muted)] p-5 rounded-xl">
                {AI_SYSTEM_PROMPT}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Syntax Help Modal */}
      {showSyntaxHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSyntaxHelp(false)}>
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <HelpCircle size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)]">Infographic 语法速查</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSyntaxHelp(false)}
              >
                <X size={18} />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                <strong>基本结构：</strong>类似 YAML，使用 2 空格缩进，键值用空格分隔
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">📋 字段白名单（items 内仅支持）</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-[var(--muted)] rounded"><code>label</code> - 标题（必填）</div>
                  <div className="p-2 bg-[var(--muted)] rounded"><code>desc</code> - 描述</div>
                  <div className="p-2 bg-[var(--muted)] rounded"><code>value</code> - 数值（仅限数字！）</div>
                  <div className="p-2 bg-[var(--muted)] rounded"><code>icon</code> - 图标 mdi/xxx</div>
                  <div className="p-2 bg-[var(--muted)] rounded col-span-2"><code>children</code> - 子节点（用于层级结构）</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">⚠️ 常见错误</h4>
                <div className="text-sm space-y-1 text-red-600">
                  <div>❌ <code>value status</code> → value 只能是数字</div>
                  <div>❌ <code>status 完成</code> → status 字段不存在</div>
                  <div>❌ <code>color #ff0000</code> → 颜色用 theme.palette</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">✅ 正确示例</h4>
                <pre className="text-xs font-mono bg-[var(--muted)] p-3 rounded-lg overflow-x-auto">{`infographic sequence-zigzag-steps-underline-text
data
  title 流程标题
  items
    - label 步骤一
      desc 说明文字
      icon mdi/check
    - label 步骤二
theme
  palette #3b82f6 #10b981`}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="radial-glow w-80 h-80 -top-40 -right-40 fixed" />
      <div className="radial-glow w-64 h-64 bottom-10 -left-32 fixed" />
    </div>
  );
}
