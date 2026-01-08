import { useEffect, useRef, useState, useMemo } from 'react';
import { Infographic, getTemplates, type InfographicOptions } from '@antv/infographic';
import {
  LayoutDashboard,
  Grid3X3,
  LayoutList,
  GitCompare,
  Clock,
  Network,
  TreeDeciduous,
  BarChart3,
  Pencil,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui';

// Trigger template registration and get all templates
const AVAILABLE_TEMPLATES = getTemplates();

// Generate default data for any template
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDefaultData(template: string): { title: string; items: any[] } {
  const isCompare = template.startsWith('compare-');
  const isHierarchy = template.startsWith('hierarchy-');
  const isChart = template.includes('chart-');
  const isPie = template.includes('pie');

  if (isCompare && template.includes('swot')) {
    return {
      title: 'SWOT 分析',
      items: [
        { label: 'Strengths', children: [{ label: '优势点1' }, { label: '优势点2' }] },
        { label: 'Weaknesses', children: [{ label: '劣势点1' }, { label: '劣势点2' }] },
        { label: 'Opportunities', children: [{ label: '机会点1' }, { label: '机会点2' }] },
        { label: 'Threats', children: [{ label: '威胁点1' }, { label: '威胁点2' }] },
      ],
    };
  }

  if (isCompare) {
    return {
      title: '对比分析',
      items: [
        { label: '方案A', children: [{ label: '特点1', desc: '描述1' }, { label: '特点2', desc: '描述2' }] },
        { label: '方案B', children: [{ label: '特点1', desc: '描述1' }, { label: '特点2', desc: '描述2' }] },
      ],
    };
  }

  if (isHierarchy) {
    return {
      title: '组织架构',
      items: [{
        label: '总部',
        children: [
          { label: '部门A', children: [{ label: '团队1' }, { label: '团队2' }] },
          { label: '部门B', children: [{ label: '团队3' }, { label: '团队4' }] },
        ],
      }],
    };
  }

  if (isChart && isPie) {
    return {
      title: '数据分布',
      items: [
        { label: '类别A', value: 35 },
        { label: '类别B', value: 28 },
        { label: '类别C', value: 22 },
        { label: '其他', value: 15 },
      ],
    };
  }

  if (isChart) {
    return {
      title: '数据统计',
      items: [
        { label: '1月', value: 120 },
        { label: '2月', value: 150 },
        { label: '3月', value: 180 },
        { label: '4月', value: 200 },
        { label: '5月', value: 220 },
      ],
    };
  }

  // Default for list, sequence, relation, quadrant
  return {
    title: template.split('-').slice(0, 2).join(' '),
    items: [
      { label: '步骤一', desc: '第一步描述', value: 1 },
      { label: '步骤二', desc: '第二步描述', value: 2 },
      { label: '步骤三', desc: '第三步描述', value: 3 },
      { label: '步骤四', desc: '第四步描述', value: 4 },
    ],
  };
}

// Group templates by category
function categorizeTemplates(): Record<CategoryKey, string[]> {
  const categories: Record<CategoryKey, string[]> = {
    compare: [],
    list: [],
    sequence: [],
    quadrant: [],
    hierarchy: [],
    relation: [],
    chart: [],
  };

  for (const t of AVAILABLE_TEMPLATES) {
    if (t.startsWith('compare-')) categories.compare.push(t);
    else if (t.startsWith('list-')) categories.list.push(t);
    else if (t.startsWith('sequence-')) categories.sequence.push(t);
    else if (t.startsWith('quadrant-')) categories.quadrant.push(t);
    else if (t.startsWith('hierarchy-')) categories.hierarchy.push(t);
    else if (t.startsWith('relation-')) categories.relation.push(t);
    else if (t.startsWith('chart-')) categories.chart.push(t);
  }

  return categories;
}

const CATEGORIZED_TEMPLATES = categorizeTemplates();

interface GalleryProps {
  onBack: () => void;
  onNavigateToPlayground?: (config?: InfographicOptions, theme?: string) => void;
}

type CategoryKey = 'compare' | 'list' | 'sequence' | 'quadrant' | 'hierarchy' | 'relation' | 'chart';

interface CategoryInfo {
  key: CategoryKey;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'compare', name: `对比`, icon: <GitCompare size={18} />, description: 'SWOT 分析、对比图' },
  { key: 'list', name: `列表`, icon: <LayoutList size={18} />, description: '网格、行列布局' },
  { key: 'sequence', name: `流程`, icon: <Clock size={18} />, description: '时间线、步骤流程' },
  { key: 'quadrant', name: `象限`, icon: <Grid3X3 size={18} />, description: '四象限分析图' },
  { key: 'hierarchy', name: `层级`, icon: <TreeDeciduous size={18} />, description: '树形结构、组织架构' },
  { key: 'relation', name: `关系`, icon: <Network size={18} />, description: '韦恩图、关系网络' },
  { key: 'chart', name: `图表`, icon: <BarChart3 size={18} />, description: '柱状图、条形图' },
];

const THEMES = ['light', 'dark', 'hand-drawn'];

interface InfographicRendererProps {
  options: InfographicOptions;
  theme: string;
}

function InfographicRenderer({ options, theme }: InfographicRendererProps) {
  const containerId = useRef(`infographic-${Math.random().toString(36).slice(2)}`);
  const instanceRef = useRef<Infographic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when theme changes
  useEffect(() => {
    setRenderKey(k => k + 1);
  }, [theme]);

  useEffect(() => {
    const container = document.getElementById(containerId.current);
    if (!container) return;

    // Destroy previous instance
    if (instanceRef.current) {
      instanceRef.current.destroy?.();
      instanceRef.current = null;
    }
    container.innerHTML = '';
    setError(null);

    try {
      const instance = new Infographic({
        container: `#${containerId.current}`,
        width: options.width || 600,
        height: options.height || 400,
        template: options.template,
        theme,
        data: options.data,
      });

      instance.on('error', (err: Error | Error[]) => {
        const msg = Array.isArray(err) ? err.map(e => e.message).join('; ') : err.message;
        console.error('Infographic error event:', msg);
        setError(msg);
      });

      instance.on('warning', (warnings: Error[]) => {
        console.warn('Infographic warnings:', warnings.map(w => w.message));
      });

      instance.render();
      instanceRef.current = instance;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Infographic render error:', err);
      setError(msg);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy?.();
        instanceRef.current = null;
      }
    };
  }, [options.template, options.width, options.height, theme, renderKey]);

  return (
    <div className="relative w-full bg-white rounded-lg overflow-auto" style={{ minHeight: options.height || 400 }}>
      <div id={containerId.current} className="flex items-center justify-center" style={{ minWidth: '100%', minHeight: '100%' }} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 text-sm p-4 text-center rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export function InfographicGallery({ onNavigateToPlayground }: Omit<GalleryProps, 'onBack'>) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('compare');
  const [selectedTheme, setSelectedTheme] = useState('light');

  // 动态生成当前分类的所有模板配置
  const currentTemplates = useMemo(() => {
    const templateNames = CATEGORIZED_TEMPLATES[activeCategory] || [];
    return templateNames.map((template): InfographicOptions => ({
      width: 600,
      height: template.includes('hierarchy') || template.includes('quadrant') ? 500 : 400,
      template,
      data: generateDefaultData(template),
    }));
  }, [activeCategory]);

  const activeInfo = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 gradient-bg rounded-xl shadow-[var(--shadow-accent)]">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-[var(--foreground)]">
                Infographic <span className="gradient-text">Gallery</span>
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                {AVAILABLE_TEMPLATES.length}+ 专业信息图模板
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {onNavigateToPlayground && (
              <Button
                onClick={() => onNavigateToPlayground()}
                className="group"
              >
                <Sparkles size={18} />
                Playground
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">主题</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="h-10 px-4 text-sm border border-[var(--border)] rounded-xl bg-[var(--card)] focus-ring transition-all hover:border-[var(--accent)]/30"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section Label */}
        <div className="mb-6">
          <Badge variant="accent" dot dotPulse>
            模板分类
          </Badge>
        </div>

        {/* Category Tabs - Sticky & Scrollable */}
        <div className="sticky top-[72px] z-10 -mx-6 px-6 py-4 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] mb-8 transition-all supports-[backdrop-filter]:bg-[var(--background)]/60">
          <div className="flex overflow-x-auto gap-3 pb-1 no-scrollbar items-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'group flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  activeCategory === cat.key
                    ? 'gradient-bg text-white shadow-[var(--shadow-accent)] scale-105'
                    : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] hover:shadow-sm'
                )}
              >
                <span className={cn(
                  'transition-transform duration-200',
                  activeCategory !== cat.key && 'group-hover:scale-110'
                )}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs transition-colors',
                  activeCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--muted)]/80'
                )}>
                  {CATEGORIZED_TEMPLATES[cat.key].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Description */}
        <Card className="mb-8 bg-gradient-to-r from-[var(--card)] to-[var(--background)] border-none shadow-none">
          <CardContent className="flex items-center gap-4 p-0">
            <div className="p-3 gradient-bg rounded-xl shadow-sm">
              {activeInfo?.icon && (
                <span className="text-white">{activeInfo.icon}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {activeInfo?.name} 模板
              </h2>
              <p className="text-[var(--muted-foreground)]">
                {activeInfo?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentTemplates.map((options, index) => (
            <Card
              key={`${activeCategory}-${index}-${selectedTheme}`}
              hover
              className="group border border-[var(--border)]/60 overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between bg-transparent border-b-0 pb-0 pt-5 px-5">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {(options.data as { title?: string })?.title || `模板 ${index + 1}`}
                  </h3>
                  <p className="text-xs font-mono text-[var(--muted-foreground)] mt-1 opacity-70">
                    {options.template as string}
                  </p>
                </div>
                {onNavigateToPlayground && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToPlayground(options, selectedTheme)}
                    className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                  >
                    <Pencil size={14} className="mr-1" />
                    编辑
                  </Button>
                )}
              </CardHeader>
              <CardContent 
                className="p-4"
                style={{ minHeight: (Number(options.height) || 400) + 20 }}
              >
                <div className="rounded-lg overflow-hidden bg-[var(--muted)]/30 p-2 transition-colors group-hover:bg-[var(--muted)]/50">
                   <InfographicRenderer options={options} theme={selectedTheme} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentTemplates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <LayoutDashboard size={28} className="text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--muted-foreground)]">该分类暂无模板示例</p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="radial-glow w-96 h-96 -top-48 -right-48 fixed" />
      <div className="radial-glow w-64 h-64 bottom-20 -left-32 fixed" />
    </div>
  );
}
