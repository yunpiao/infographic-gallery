import { useEffect, useRef, useState, useCallback } from 'react';
import { Infographic, getTemplates, parseSyntax, type InfographicOptions } from '@antv/infographic';
import { LayoutDashboard, Play, RotateCcw, Copy, Check, Download, Code, Sparkles, FileImage, ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaygroundProps {
  onBack: () => void;
  initialConfig?: InfographicOptions;
  initialTheme?: string;
}

const AVAILABLE_TEMPLATES = getTemplates();

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

const AI_SYSTEM_PROMPT = `## 角色说明

你是一个专业的信息图生成助手，熟悉 AntV Infographic 语法（形如 Mermaid 的文本语法）。当用户给出内容或需求时，你需要：
1. 提炼关键信息结构（标题、描述、条目、层级、指标等）
2. 结合语义选择合适的模板（template）与主题
3. 将内容用规范的 Infographic 语法描述，方便实时流式渲染

## 输出格式

始终使用纯语法文本，外层包裹 \`\`\`plain 代码块，不得输出解释性文字。语法结构示例：

\`\`\`plain
infographic list-row-horizontal-icon-arrow
data
  title 标题
  desc 描述
  items
    - label 条目
      value 12.5
      desc 说明
      icon mdi/rocket-launch
theme
  palette #3b82f6 #8b5cf6 #f97316
\`\`\`

## 语法要点

- 第一行以 \`infographic <template-name>\` 开头，模板从下方列表中选择
- 使用 block 描述 data / theme，层级通过两个空格缩进
- 键值对使用「键 值」形式，数组通过 \`-\` 分项
- icon 值直接提供关键词或图标名（如 \`mdi/chart-line\`）
- data 应包含 title/desc/items（根据语义可省略不必要字段）
- data.items 可包含 label(string)/value(number)/desc(string)/icon(string)/children(object) 等字段，children 表示层级结构
- 对比类模板（名称以 \`compare-\` 开头）应构建两个根节点，所有对比项作为这两个根节点的 children，确保结构清晰
- 可以添加 theme 来切换色板或深浅色；
- 严禁输出 JSON、Markdown、解释或额外文本

## 模板 (template)

- sequence-zigzag-steps-underline-text
- sequence-horizontal-zigzag-underline-text
- sequence-circular-simple
- sequence-filter-mesh-simple
- sequence-mountain-underline-text
- sequence-cylinders-3d-simple
- compare-binary-horizontal-simple-fold
- compare-hierarchy-left-right-circle-node-pill-badge
- quadrant-quarter-simple-card
- quadrant-quarter-circular
- list-grid-badge-card
- list-grid-candy-card-lite
- list-grid-ribbon-card
- list-row-horizontal-icon-arrow
- relation-circle-icon-badge
- sequence-ascending-steps
- compare-swot
- sequence-color-snake-steps-horizontal-icon-line
- sequence-pyramid-simple
- list-sector-plain-text
- sequence-roadmap-vertical-simple
- sequence-zigzag-pucks-3d-simple
- sequence-ascending-stairs-3d-underline-text
- compare-binary-horizontal-badge-card-arrow
- compare-binary-horizontal-underline-text-vs
- hierarchy-tree-tech-style-capsule-item
- hierarchy-tree-curved-line-rounded-rect-node
- hierarchy-tree-tech-style-badge-card
- chart-column-simple
- chart-bar-plain-text
- chart-line-plain-text
- chart-pie-plain-text
- chart-pie-compact-card
- chart-pie-donut-plain-text
- chart-pie-donut-pill-badge

## 注意事项

- 输出必须符合语法规范与缩进规则，方便模型流式输出
- 结合用户输入给出结构化 data，勿编造无关内容
- 如用户指定风格/色彩/语气，可在 theme 中体现
- 若信息不足，可合理假设补全，但要保持连贯与可信
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
  const [inputMode, setInputMode] = useState<InputMode>('json');
  const [jsonText, setJsonText] = useState(JSON.stringify(initialConfig || DEFAULT_CONFIG, null, 2));
  const [syntaxText, setSyntaxText] = useState(DEFAULT_SYNTAX);
  const [parseError, setParseError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'light');
  const [copied, setCopied] = useState(false);
  const [svgCopied, setSvgCopied] = useState(false);
  const [showSvgSource, setShowSvgSource] = useState(false);
  const [svgSource, setSvgSource] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const [containerId] = useState(() => `playground-${Math.random().toString(36).slice(2)}`);
  const instanceRef = useRef<Infographic | null>(null);

  const renderInfographic = useCallback((config: InfographicOptions, theme: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (instanceRef.current) {
      instanceRef.current.destroy?.();
      instanceRef.current = null;
    }
    setRenderError(null);

    try {
      const instance = new Infographic({
        container: `#${containerId}`,
        width: config.width || 600,
        height: config.height || 400,
        template: config.template,
        theme,
        data: config.data,
        editable: true,
      });

      instance.on('error', (err: Error | Error[]) => {
        const msg = Array.isArray(err) ? err.map(e => e.message).join('; ') : err.message;
        setRenderError(msg);
      });


      instance.render();
      instanceRef.current = instance;
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

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
      
      renderInfographic(config, selectedTheme);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : '解析失败');
    }
  }, [jsonText, syntaxText, inputMode, selectedTheme, renderInfographic]);

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
    setJsonText(JSON.stringify(config, null, 2));
    setParseError(null);
  }, []);

  const getSvgElement = useCallback(() => {
    const container = document.getElementById(containerId);
    return container?.querySelector('svg');
  }, []);

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

  const [pngCopied, setPngCopied] = useState(false);
  const handleCopyPng = useCallback(async () => {
    if (!instanceRef.current) return;
    try {
      const dataUrl = await instanceRef.current.toDataURL({ type: 'png' });
      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setPngCopied(true);
      setTimeout(() => setPngCopied(false), 2000);
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
    // 防抖：500ms 后渲染
    const timer = setTimeout(() => {
      handleRender();
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonText, syntaxText, inputMode, selectedTheme]);

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy?.();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <LayoutDashboard size={20} className="text-blue-600" />
            </button>
            <h1 className="text-xl font-semibold text-neutral-800">Infographic Playground</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
            >
              <Sparkles size={16} />
              AI 提示词
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">主题:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Example Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-neutral-500 py-1">示例:</span>
          {EXAMPLE_CONFIGS.map((example) => (
            <button
              key={example.name}
              onClick={() => handleExampleSelect(example.config)}
              className="px-3 py-1 text-sm bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {example.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Editor Panel */}
          <div className="flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputMode('json')}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    inputMode === 'json' ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  JSON
                </button>
                <button
                  onClick={() => setInputMode('syntax')}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    inputMode === 'syntax' ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  语法
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  title="复制"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  title="重置"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleRender}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play size={14} />
                  渲染
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={inputMode === 'json' ? jsonText : syntaxText}
                onChange={(e) => inputMode === 'json' ? setJsonText(e.target.value) : setSyntaxText(e.target.value)}
                className={cn(
                  "w-full h-full p-4 font-mono text-sm resize-none focus:outline-none",
                  parseError && "border-2 border-red-300"
                )}
                placeholder={inputMode === 'json' ? '输入 JSON 配置...' : '输入 Infographic 语法...'}
                spellCheck={false}
              />
              {parseError && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-200">
                  {parseError}
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-500">
              可用模板: {AVAILABLE_TEMPLATES.length} 个
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-medium text-neutral-800">预览 (可编辑)</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <span>SVG:</span>
                  <button
                    onClick={handleViewSvgSource}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                    title="查看源码"
                  >
                    <Code size={16} />
                  </button>
                  <button
                    onClick={handleCopySvg}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                    title="复制"
                  >
                    {svgCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                    title="下载"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div className="w-px h-4 bg-neutral-200" />
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <span>PNG:</span>
                  <button
                    onClick={handleCopyPng}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                    title="复制"
                  >
                    {pngCopied ? <Check size={16} className="text-green-500" /> : <ClipboardCopy size={16} />}
                  </button>
                  <button
                    onClick={handleDownloadPng}
                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                    title="下载"
                  >
                    <FileImage size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto relative">
              <div
                id={containerId}
                className="w-full h-full flex items-center justify-center"
              />
              {renderError && (
                <div className="absolute inset-4 flex items-center justify-center bg-red-50 text-red-600 text-sm rounded-lg p-4 text-center">
                  {renderError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Source Modal */}
      {showSvgSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSvgSource(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-medium text-neutral-800">SVG 源码</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(svgSource);
                    setSvgCopied(true);
                    setTimeout(() => setSvgCopied(false), 2000);
                  }}
                  className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  {svgCopied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={() => setShowSvgSource(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs font-mono text-neutral-700 whitespace-pre-wrap break-all">
                {svgSource}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPrompt(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                <h3 className="font-medium text-neutral-800">AI 信息图生成提示词</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {promptCopied ? '已复制' : '复制提示词'}
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-4 p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
                💡 将此提示词复制到 ChatGPT、Claude 或其他 AI 工具中，然后描述你想要的信息图内容，AI 会生成 Infographic 语法代码。
              </div>
              <pre className="text-xs font-mono text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg">
                {AI_SYSTEM_PROMPT}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
