# 加拿大移民分数计算器（React + TypeScript + Tailwind）

前端已重构为 **React + TypeScript + Vite + Tailwind CSS**。

## 功能

1. 联邦 EE CRS 算分（已按 2025-03-25 后规则处理）
2. BCPNP Skills Immigration 200 分制算分
3. OINP EOI 算分
4. EE 邀请历史
5. BCPNP 邀请历史
6. OINP 邀请历史
7. 官网邀请记录自动抓取（EE / BCPNP / OINP）

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 邀请记录抓取

```bash
# 手动抓取一次（会更新 data/history_data.json 与 public/data/history_data.json）
npm run scrape:history

# 安装每天 08:15 自动抓取的 cron 任务
npm run scrape:history:install-cron
```

可选参数：

- `CRON_EXPR="0 7 * * *"` 自定义 cron 时间表达式
- `NODE_BIN=/opt/homebrew/bin/node` 指定 node 路径

## 部署

### Vercel（前端）

仓库已提供 `vercel.json`，可直接在 Vercel 导入项目并部署：

- Build Command: `npm run build`
- Output Directory: `dist`

### Render（定时爬虫）

仓库已提供 `render.yaml`，包含一个 Cron Job 服务：

- Name: `canada-immigration-scraper`
- Schedule: `15 16 * * *`（UTC，每天一次）
- Build Command: `npm --prefix scraper install`
- Start Command: `npm --prefix scraper start`

## 目录结构

- `src/App.tsx`：主界面与状态管理
- `src/lib/calculators.ts`：EE / BCPNP / OINP 计算逻辑（TypeScript）
- `src/lib/history.ts`：历史邀请数据
- `src/react.css`：Tailwind 入口与组件层样式
- `tailwind.config.js`：Tailwind 配置
- `postcss.config.js`：PostCSS 配置
