# 加拿大移民分数计算器 — AI Vibe Coding 开发计划

**版本**: v1.0
**日期**: 2026-03-05
**开发模式**: AI Vibe Coding（AI 辅助全栈开发）

---

## 一、技术选型

### 1.1 技术栈

```
前端架构：
├── HTML5          — 语义化结构
├── CSS3           — 自定义样式 + CSS Variables + Flexbox/Grid
├── Vanilla JS     — 无框架，保持轻量可部署
└── Chart.js CDN   — 历史数据折线图

文件结构：
CanadaImmigration/
├── index.html          # 入口文件 + HTML结构
├── css/
│   └── styles.css      # 全局样式
└── js/
    ├── data.js         # 评分表 + 历史数据常量
    ├── calculators.js  # CRS / BCPNP / OINP 计算逻辑
    └── app.js          # UI交互 + Tab切换 + 图表渲染
```

### 1.2 选型理由

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | 无框架 | 零依赖，可直接双击 index.html 打开，无需构建工具 |
| 样式 | 纯 CSS | 避免 CDN 依赖，完全离线可用 |
| 图表 | Chart.js | 成熟稳定，CDN 加载，API 简单 |
| 打包 | 无 | 静态文件即交付物 |

---

## 二、模块设计

### 2.1 data.js — 数据层

**职责**：存储所有评分常量和历史数据，不含任何业务逻辑。

```
数据结构：
├── CRS_TABLES
│   ├── ageNoSpouse[]        // 年龄分数表（单身）
│   ├── ageSpouse[]          // 年龄分数表（已婚）
│   ├── educationNoSpouse{}  // 学历分数（单身）
│   ├── educationSpouse{}    // 学历分数（已婚）
│   ├── firstLangNoSpouse{}  // 第一语言 CLB→分数（单身）
│   ├── firstLangSpouse{}    // 第一语言 CLB→分数（已婚）
│   ├── secondLang{}         // 第二语言 CLB→分数
│   ├── canadianWorkNo[]     // 加拿大工作经验（单身）
│   ├── canadianWorkSp[]     // 加拿大工作经验（已婚）
│   ├── spouseEducation{}    // 配偶学历分数
│   ├── spouseLang{}         // 配偶语言 CLB→分数
│   └── spouseWork[]         // 配偶工作经验分数
│
├── IELTS_TO_CLB             // IELTS成绩 → CLB 转换表
│   ├── listening[]
│   ├── reading[]
│   ├── writing[]
│   └── speaking[]
│
├── BCPNP_TABLES
│   ├── wageScore{}          // 工资比例 → 分数
│   ├── noctierScore{}       // TEER等级 → 分数
│   ├── locationScore{}      // 地区 → 分数
│   ├── workExpScore[]       // 工作经验 → 分数
│   ├── educationScore{}     // 学历 → 分数
│   └── languageScore{}      // CLB → 分数
│
├── EE_HISTORY[]             // EE近12月邀请记录
├── BCPNP_HISTORY[]          // BCPNP近12月邀请记录
└── OINP_HISTORY[]           // OINP近12月邀请记录
```

### 2.2 calculators.js — 计算层

**职责**：纯函数计算，输入参数返回分数结果，不操作 DOM。

```javascript
// 主要导出函数接口：

calculateCRS(formData) → {
  total: number,
  sectionA: {
    age, education, firstLang, secondLang, canadianWork,
    subtotal, max
  },
  sectionB: {
    spouseEducation, spouseLang, spouseWork,
    subtotal, max
  },
  sectionC: {
    eduLang, eduCanWork, foreignLang, foreignCanWork, certLang,
    subtotal, max
  },
  sectionD: {
    pnomination, jobOffer, canadianEdu, french, sibling,
    subtotal, max
  }
}

calculateBCPNP(formData) → {
  total: number,
  breakdown: {
    jobOffer: { wage, noc, subtotal },
    location: number,
    workExp: number,
    education: number,
    language: number,
    adaptability: number
  },
  eligible: boolean,
  stream: string
}

evaluateOINP(formData) → {
  streams: [
    { name, eligible, missing: [] }
  ]
}

ieltsToCLB(skill, score) → number   // 单项转换
```

### 2.3 app.js — 视图层

**职责**：DOM 操作、事件绑定、图表渲染、表单状态管理。

```
模块划分：
├── TabManager          // Tab 切换逻辑
├── EECalculatorUI      // EE 表单 + 实时计算 + 结果渲染
├── BCPNPCalculatorUI   // BCPNP 表单 + 计算 + 结果渲染
├── OINPEvaluatorUI     // OINP 表单 + 资格判断渲染
├── HistoryChart        // Chart.js 图表初始化
└── HistoryTable        // 历史数据表格渲染
```

---

## 三、开发任务拆解

### Phase 1：数据层（data.js）

| 任务 | 内容 | 估时 |
|------|------|------|
| T1.1 | 编写完整 CRS 评分数据表 | 30min |
| T1.2 | 编写 IELTS/CELPIP → CLB 转换表 | 15min |
| T1.3 | 编写 BCPNP SIRS 评分数据表 | 20min |
| T1.4 | 整理 EE 历史邀请数据（近12月，约24条） | 20min |
| T1.5 | 整理 BCPNP 历史邀请数据（近12月，约24条） | 15min |
| T1.6 | 整理 OINP 历史邀请数据（近12月，约12条） | 10min |

### Phase 2：计算层（calculators.js）

| 任务 | 内容 | 估时 |
|------|------|------|
| T2.1 | 实现 CRS Section A（核心人力资本）计算 | 30min |
| T2.2 | 实现 CRS Section B（配偶因素）计算 | 15min |
| T2.3 | 实现 CRS Section C（技能可转移）计算 | 30min |
| T2.4 | 实现 CRS Section D（附加分）计算 | 15min |
| T2.5 | 实现 BCPNP SIRS 评分计算 | 30min |
| T2.6 | 实现 OINP 资格评估逻辑 | 20min |
| T2.7 | 实现 IELTS/CELPIP → CLB 转换函数 | 10min |

### Phase 3：HTML 结构（index.html）

| 任务 | 内容 |
|------|------|
| T3.1 | Header + Tab 导航结构 |
| T3.2 | EE 计算器表单 HTML（6个分区） |
| T3.3 | BCPNP 计算器表单 HTML |
| T3.4 | OINP 评估器表单 HTML |
| T3.5 | 三个历史记录面板（图表容器 + 表格） |
| T3.6 | 结果展示区域（分数卡片 + 分项列表） |

### Phase 4：样式层（styles.css）

| 任务 | 内容 |
|------|------|
| T4.1 | CSS Variables（颜色、间距、字体） |
| T4.2 | 全局重置 + 基础排版 |
| T4.3 | Header + Tab 导航样式 |
| T4.4 | 表单组件样式（输入框、下拉、单选） |
| T4.5 | 结果卡片 + 分项列表样式 |
| T4.6 | 历史图表容器 + 表格样式 |
| T4.7 | 响应式适配（平板 768px+） |
| T4.8 | 动画过渡效果 |

### Phase 5：交互层（app.js）

| 任务 | 内容 |
|------|------|
| T5.1 | Tab 切换 + URL hash 同步 |
| T5.2 | 婚姻状态切换 → 显/隐配偶区域 |
| T5.3 | 语言测试类型切换 → 切换输入字段 |
| T5.4 | IELTS 输入实时 → CLB 转换显示 |
| T5.5 | EE 表单实时计算 + 结果渲染 |
| T5.6 | BCPNP 表单计算 + 结果渲染 |
| T5.7 | OINP 表单评估 + 结果渲染 |
| T5.8 | 三个历史图表初始化（Chart.js） |
| T5.9 | 三个历史数据表格渲染 |
| T5.10 | 统计摘要计算（最近/最高/最低/平均） |

---

## 四、关键实现细节

### 4.1 CRS 技能可转移计算规则（重要）

技能可转移因素总上限 100 分，每个组合上限 50 分：

```javascript
// 组合1：学历 + 第一语言（最高50分）
function calcEduLang(edu, langCLB) {
  const isHigherEdu = ['bachelors', 'two_or_more', 'masters', 'phd'].includes(edu);
  const isPostSec = ['one_year', 'two_year'].includes(edu);
  if (isHigherEdu) {
    if (langCLB >= 9) return 50;
    if (langCLB >= 7) return 25;
  } else if (isPostSec) {
    if (langCLB >= 9) return 25;
    if (langCLB >= 7) return 13;
  }
  return 0;
}

// 总上限控制
const skillTransfer = Math.min(100, combo1 + combo2 + combo3 + combo4 + combo5);
```

### 4.2 语言测试 CLB 转换逻辑

```javascript
// IELTS → CLB（以 reading 为例）
function ieltsReadingToCLB(score) {
  if (score >= 8.0) return 10;
  if (score >= 7.0) return 9;
  if (score >= 6.5) return 8;
  if (score >= 6.0) return 7;
  if (score >= 5.0) return 6;
  if (score >= 4.0) return 5;
  if (score >= 3.5) return 4;
  return 3; // CLB 4 以下
}
```

### 4.3 BCPNP 工资计算

```javascript
const BC_MEDIAN_WAGE = 37.0; // CAD/小时，近似值

function wageScore(hourlyWage) {
  const ratio = hourlyWage / BC_MEDIAN_WAGE;
  if (ratio >= 2.0) return 200;
  if (ratio >= 1.5) return 180;
  if (ratio >= 1.2) return 160;
  if (ratio >= 1.0) return 120;
  if (ratio >= 0.8) return 80;
  if (ratio >= 0.6) return 40;
  return 0;
}
```

### 4.4 图表配置（Chart.js）

```javascript
// 历史趋势折线图配置
const chartConfig = {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: '最低邀请分数',
      data: scores,
      borderColor: '#D52B1E',
      backgroundColor: 'rgba(213,43,30,0.1)',
      tension: 0.4,
      pointRadius: 4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index' }
    },
    scales: {
      y: { min: 400, suggestedMax: 600 }
    }
  }
};
```

---

## 五、代码质量规范

| 规范 | 要求 |
|------|------|
| 函数 | 单一职责，纯函数优先 |
| 命名 | 驼峰命名，中文注释关键逻辑 |
| 常量 | 全大写，集中在 data.js |
| 错误处理 | 输入验证，边界值保护（null/undefined） |
| 注释 | 评分公式来源注明官方依据 |

---

## 六、免责声明处理

所有计算结果页面底部必须显示：

> ⚠️ 本工具仅供参考，数据基于公开资料整理，可能存在偏差。实际申请结果以 IRCC、BC PNP、OINP 官方决定为准。建议咨询持牌移民顾问（RCIC）。

---

## 七、执行顺序

```
Step 1: 创建目录结构
Step 2: 编写 js/data.js        ← 数据基础
Step 3: 编写 js/calculators.js ← 计算逻辑
Step 4: 编写 index.html        ← HTML 结构
Step 5: 编写 css/styles.css    ← 样式
Step 6: 编写 js/app.js         ← UI 交互
Step 7: 集成测试（手动验证关键计算）
```
