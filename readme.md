# Canada Immigration Score & Draw Tracker (React + TypeScript + Tailwind)

## Overview

This project is a practical tracker for major Canadian immigration pathways, combining score calculators and draw-history data in one place. It includes a **React + TypeScript + Vite + Tailwind CSS** frontend for interactive calculation and visualization, plus a Node.js scraper that regularly pulls official EE / BCPNP / OINP draw updates. The frontend is typically deployed to Vercel, while scheduled scraping runs on Render Cron.

## Features

1. Federal EE CRS calculator (updated for rules after 2025-03-25)
2. BCPNP Skills Immigration 200-point calculator
3. OINP EOI calculator
4. EE invitation history
5. BCPNP invitation history
6. OINP invitation history
7. Automated official draw-history scraping (EE / BCPNP / OINP)

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Scrape Draw History

```bash
# Run scraper once (updates data/history_data.json and public/data/history_data.json)
npm run scrape:history

# Install a daily cron job at 08:15
npm run scrape:history:install-cron
```

Optional parameters:

- `CRON_EXPR="0 7 * * *"` custom cron expression
- `NODE_BIN=/opt/homebrew/bin/node` custom node path

## Deployment

### Vercel (Frontend)

This repo includes `vercel.json`, so you can import and deploy directly on Vercel:

- Build Command: `npm run build`
- Output Directory: `dist`

### Render (Scheduled Scraper)

This repo includes `render.yaml` with a Cron Job service:

- Name: `canada-immigration-score-and-draw-tracker-scraper`
- Schedule: `15 16 * * *` (UTC, once per day)
- Build Command: `npm --prefix scraper install`
- Start Command: `npm --prefix scraper start`

## Project Structure

- `src/App.tsx`: main UI and state management
- `src/lib/calculators.ts`: EE / BCPNP / OINP calculator logic (TypeScript)
- `src/lib/history.ts`: historical draw data
- `src/react.css`: Tailwind entry and component-layer styles
- `tailwind.config.js`: Tailwind config
- `postcss.config.js`: PostCSS config

---

# 中文版

## 概述

这是一个面向加拿大主流移民通道的实用追踪项目，把算分工具和邀请历史数据整合在同一站点。项目包含一个基于 **React + TypeScript + Vite + Tailwind CSS** 的前端，用于交互式计算与展示；同时包含 Node.js 爬虫，定期抓取 EE / BCPNP / OINP 官网邀请数据。常见部署方式是前端发布到 Vercel，定时爬虫运行在 Render Cron。

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

- Name: `canada-immigration-score-and-draw-tracker-scraper`
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
