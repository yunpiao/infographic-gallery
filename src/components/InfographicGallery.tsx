import { useEffect, useRef, useState, useMemo } from 'react';
import { Infographic, getTemplates, type InfographicOptions } from '@antv/infographic';
import { ArrowLeft, Grid3X3, LayoutList, GitCompare, Clock, Network, TreeDeciduous, BarChart3, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { key: 'compare', name: `对比 (${CATEGORIZED_TEMPLATES.compare.length})`, icon: <GitCompare size={20} />, description: 'SWOT 分析、对比图' },
  { key: 'list', name: `列表 (${CATEGORIZED_TEMPLATES.list.length})`, icon: <LayoutList size={20} />, description: '网格、行列布局' },
  { key: 'sequence', name: `流程 (${CATEGORIZED_TEMPLATES.sequence.length})`, icon: <Clock size={20} />, description: '时间线、步骤流程' },
  { key: 'quadrant', name: `象限 (${CATEGORIZED_TEMPLATES.quadrant.length})`, icon: <Grid3X3 size={20} />, description: '四象限分析图' },
  { key: 'hierarchy', name: `层级 (${CATEGORIZED_TEMPLATES.hierarchy.length})`, icon: <TreeDeciduous size={20} />, description: '树形结构、组织架构' },
  { key: 'relation', name: `关系 (${CATEGORIZED_TEMPLATES.relation.length})`, icon: <Network size={20} />, description: '韦恩图、关系网络' },
  { key: 'chart', name: `图表 (${CATEGORIZED_TEMPLATES.chart.length})`, icon: <BarChart3 size={20} />, description: '柱状图、条形图' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _TEMPLATE_OPTIONS: Record<CategoryKey, InfographicOptions[]> = {
  compare: [
    {
      width: 600,
      height: 400,
      template: 'compare-swot',
      data: {
        title: 'SWOT 战略分析',
        items: [
          { label: 'Strengths', children: [{ label: '技术创新能力强' }, { label: '品牌知名度高' }] },
          { label: 'Weaknesses', children: [{ label: '成本控制待优化' }, { label: '市场覆盖有限' }] },
          { label: 'Opportunities', children: [{ label: '新兴市场需求增长' }, { label: '政策扶持力度大' }] },
          { label: 'Threats', children: [{ label: '竞争对手快速发展' }, { label: '技术迭代加速' }] },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'compare-binary-horizontal-underline-text-arrow',
      data: {
        title: '商业模式对比',
        items: [
          { label: '传统模式', children: [{ label: '线下渠道为主', desc: '依赖实体店面' }, { label: '人工服务', desc: '服务成本较高' }] },
          { label: '数字化转型', children: [{ label: '全渠道整合', desc: '线上线下融合' }, { label: '智能服务', desc: '提升效率' }] },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'compare-hierarchy-left-right-circle-node-pill-badge',
      data: {
        title: '产品功能对比',
        items: [
          { label: '基础版', children: [{ label: '核心功能' }, { label: '基础支持' }] },
          { label: '专业版', children: [{ label: '高级功能' }, { label: '优先支持' }] },
        ],
      },
    },
  ],
  list: [
    {
      width: 600,
      height: 300,
      template: 'list-row-simple-horizontal-arrow',
      data: {
        title: '项目里程碑',
        items: [
          { label: '需求分析', desc: '明确项目目标' },
          { label: '系统设计', desc: '架构方案制定' },
          { label: '开发实现', desc: '编码与测试' },
          { label: '上线部署', desc: '交付与运维' },
        ],
      },
    },
    {
      width: 600,
      height: 350,
      template: 'list-row-horizontal-icon-arrow',
      data: {
        title: '互联网技术演进',
        items: [
          { label: '万维网诞生', desc: 'Tim 发明 WWW' },
          { label: 'Web 2.0', desc: '用户生成内容' },
          { label: '移动互联网', desc: '智能手机普及' },
          { label: 'AI 时代', desc: '大模型应用' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'list-grid-badge-card',
      data: {
        title: '核心功能特性',
        items: [
          { label: '数据分析', desc: '智能数据处理', value: 1 },
          { label: '报表生成', desc: '自动化报告', value: 2 },
          { label: '团队协作', desc: '高效沟通工具', value: 3 },
          { label: '安全保障', desc: '数据加密存储', value: 4 },
        ],
      },
    },
    {
      width: 600,
      height: 350,
      template: 'list-pyramid-rounded-rect-node',
      data: {
        title: '需求层次',
        items: [
          { label: '自我实现' },
          { label: '尊重需求' },
          { label: '社交需求' },
          { label: '安全需求' },
          { label: '生理需求' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'list-grid-ribbon-card',
      data: {
        title: '服务优势',
        items: [
          { label: '专业团队', desc: '10年行业经验' },
          { label: '快速响应', desc: '7x24小时支持' },
          { label: '定制方案', desc: '个性化服务' },
          { label: '质量保障', desc: '严格品控' },
        ],
      },
    },
    {
      width: 600,
      height: 350,
      template: 'list-sector-plain-text',
      data: {
        title: '业务分布',
        items: [
          { label: '华东区域', value: 35 },
          { label: '华南区域', value: 28 },
          { label: '华北区域', value: 22 },
          { label: '西部区域', value: 15 },
        ],
      },
    },
  ],
  sequence: [
    {
      width: 600,
      height: 400,
      template: 'sequence-timeline-simple',
      data: {
        title: '发展历程',
        items: [
          { label: '2020', desc: '公司成立' },
          { label: '2021', desc: '获得 A 轮融资' },
          { label: '2022', desc: '用户突破百万' },
          { label: '2023', desc: '海外市场拓展' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'sequence-ascending-steps',
      data: {
        title: '成长阶梯',
        items: [
          { label: '初级', desc: '掌握基础技能' },
          { label: '中级', desc: '独立完成项目' },
          { label: '高级', desc: '带领团队' },
          { label: '专家', desc: '行业影响力' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'sequence-snake-steps-pill-badge',
      data: {
        title: '学习路径',
        items: [
          { label: '基础知识', desc: '掌握核心概念' },
          { label: '动手实践', desc: '完成入门项目' },
          { label: '深入学习', desc: '理解原理' },
          { label: '项目实战', desc: '综合应用' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'sequence-color-snake-steps-horizontal-icon-line',
      data: {
        title: '企业发展历程',
        items: [
          { label: '创意萌芽', time: '2017' },
          { label: '项目启动', time: '2018' },
          { label: '快速增长', time: '2019' },
          { label: '规模扩张', time: '2020' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'sequence-roadmap-vertical-simple',
      data: {
        title: '产品路线图',
        items: [
          { label: 'Q1', desc: '基础功能上线' },
          { label: 'Q2', desc: '用户增长优化' },
          { label: 'Q3', desc: '企业版发布' },
          { label: 'Q4', desc: '国际化拓展' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'sequence-horizontal-zigzag-simple',
      data: {
        title: '工作流程',
        items: [
          { label: '需求分析', desc: '明确目标' },
          { label: '方案设计', desc: '制定计划' },
          { label: '开发实现', desc: '编码测试' },
          { label: '上线运营', desc: '持续优化' },
        ],
      },
    },
  ],
  quadrant: [
    {
      width: 600,
      height: 500,
      template: 'quadrant-quarter-circular',
      data: {
        title: '时间管理矩阵',
        items: [
          { label: '紧急且重要', desc: '客户投诉、系统故障' },
          { label: '重要但不紧急', desc: '战略规划、团队培训' },
          { label: '紧急但不重要', desc: '部分会议、即时消息' },
          { label: '不紧急不重要', desc: '社交媒体、闲聊' },
        ],
      },
    },
    {
      width: 600,
      height: 500,
      template: 'quadrant-quarter-simple-card',
      data: {
        title: '产品优先级矩阵',
        items: [
          { label: '高价值高成本', desc: '核心功能开发' },
          { label: '高价值低成本', desc: '快速迭代优化' },
          { label: '低价值高成本', desc: '谨慎评估' },
          { label: '低价值低成本', desc: '适时处理' },
        ],
      },
    },
  ],
  hierarchy: [
    {
      width: 600,
      height: 450,
      template: 'hierarchy-tree-tech-style-rounded-rect-node',
      data: {
        title: '组织架构',
        items: [
          {
            label: 'CEO',
            children: [
              { label: 'CTO', children: [{ label: '研发部' }, { label: '运维部' }] },
              { label: 'CFO', children: [{ label: '财务部' }, { label: '审计部' }] },
              { label: 'CMO', children: [{ label: '市场部' }, { label: '销售部' }] },
            ],
          },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'hierarchy-mindmap-branch-gradient-lined-palette',
      data: {
        title: '前端技术栈',
        items: [
          {
            label: 'Frontend',
            children: [
              { label: 'HTML/CSS' },
              { label: 'JavaScript' },
              { label: 'React/Vue' },
              { label: 'TypeScript' },
            ],
          },
        ],
      },
    },
  ],
  relation: [
    {
      width: 600,
      height: 400,
      template: 'relation-circle-icon-badge',
      data: {
        title: '生态系统',
        items: [
          { label: '核心产品' },
          { label: '合作伙伴' },
          { label: '开发者' },
          { label: '用户社区' },
          { label: '技术支持' },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'relation-circle-circular-progress',
      data: {
        title: '技能分布',
        items: [
          { label: '前端', value: 85 },
          { label: '后端', value: 75 },
          { label: '数据库', value: 70 },
          { label: 'DevOps', value: 60 },
        ],
      },
    },
  ],
  chart: [
    {
      width: 600,
      height: 400,
      template: 'chart-column-simple',
      data: {
        title: '月度销售额（万元）',
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
    {
      width: 600,
      height: 400,
      template: 'chart-bar-plain-text',
      data: {
        title: '各部门人数统计',
        items: [
          { label: '研发部', value: 45 },
          { label: '市场部', value: 30 },
          { label: '销售部', value: 25 },
          { label: '运营部', value: 20 },
          { label: '人事部', value: 10 },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'chart-pie-plain-text',
      data: {
        title: '市场份额分布',
        items: [
          { label: '产品A', value: 35 },
          { label: '产品B', value: 28 },
          { label: '产品C', value: 22 },
          { label: '其他', value: 15 },
        ],
      },
    },
    {
      width: 600,
      height: 400,
      template: 'chart-pie-donut-pill-badge',
      data: {
        title: '用户来源渠道',
        items: [
          { label: '搜索引擎', value: 40 },
          { label: '社交媒体', value: 30 },
          { label: '直接访问', value: 20 },
          { label: '其他渠道', value: 10 },
        ],
      },
    },
  ],
};

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
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 text-sm p-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export function InfographicGallery({ onBack, onNavigateToPlayground }: GalleryProps) {
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-neutral-800">Infographic Gallery</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {onNavigateToPlayground && (
              <button
                onClick={() => onNavigateToPlayground()}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Playground
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">主题:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Category Description */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-neutral-200">
          <p className="text-neutral-600">
            <strong className="text-neutral-800">
              {CATEGORIES.find((c) => c.key === activeCategory)?.name}
            </strong>
            {' - '}
            {CATEGORIES.find((c) => c.key === activeCategory)?.description}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTemplates.map((options, index) => (
            <div
              key={`${activeCategory}-${index}-${selectedTheme}`}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-800">
                    {(options.data as { title?: string })?.title || `模板 ${index + 1}`}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {options.template as string}
                  </p>
                </div>
                {onNavigateToPlayground && (
                  <button
                    onClick={() => onNavigateToPlayground(options, selectedTheme)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <Pencil size={14} />
                    编辑
                  </button>
                )}
              </div>
              <div className="p-4" style={{ minHeight: (Number(options.height) || 400) + 40 }}>
                <InfographicRenderer options={options} theme={selectedTheme} />
              </div>
            </div>
          ))}
        </div>

        {currentTemplates.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            该分类暂无模板示例
          </div>
        )}
      </div>
    </div>
  );
}
