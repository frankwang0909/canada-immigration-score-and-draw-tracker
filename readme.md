# Canada Immigration Score Calculator & Draw Tracker

## Overview

A practical tracker for major Canadian immigration pathways, combining score calculators and draw-history data in one place. Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, with a Node.js scraper that pulls official EE / BCPNP / OINP draw updates daily. Deployed to Vercel; scheduled scraping runs on GitHub Actions.

## Features

1. Federal EE CRS calculator (2026 rules, job offer points removed since 2025-03-25)
2. BCPNP Skills Immigration 200-point calculator (rules effective 2025-12-04)
3. OINP EOI calculator (multiple streams)
4. EE / BCPNP / OINP invitation history (daily auto-updated from official sites)

## Run Locally

```bash
npm install
npm run dev       # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Scrape Draw History

```bash
# Run scraper once (updates data/history_data.json and public/data/history_data.json)
npm run scrape:history

# EE only
node scraper/scraper.js --ee
```

## Deployment

### Vercel (Frontend)

Next.js is auto-detected by Vercel. Import the repo and deploy — no extra config needed.

- Build Command: `npm run build`
- Output Directory: `.next`

### GitHub Actions (Scheduled Scraper)

Workflow at `.github/workflows/scrape-history.yml`:

- Schedule: runs daily at 21:00 UTC
- Manual run: `Actions` → `Scrape Immigration History` → `Run workflow`
- Auto commit/push: enabled via `permissions: contents: write`

## Project Structure

```
src/
  app/
    layout.tsx            # Root layout: nav, footer, JSON-LD, OG metadata
    opengraph-image.tsx   # Auto-generated OG image (next/og)
    ee/page.tsx           # EE CRS calculator page
    bcpnp/page.tsx        # BCPNP calculator page
    oinp/page.tsx         # OINP EOI calculator page
    ee-history/page.tsx   # EE invite history (ISR 24h)
    bcpnp-history/        # BCPNP invite history (ISR 24h)
    oinp-history/         # OINP invite history (ISR 24h)
  components/
    EECalculator.tsx      # EE form + CRS breakdown (client)
    BCPNPCalculator.tsx   # BCPNP form + breakdown (client)
    OINPCalculator.tsx    # OINP form + breakdown (client)
    HistoryTable.tsx      # Draw history table (server)
    NavBar.tsx            # Navigation with active-link detection
  lib/
    calculators.ts        # EE / BCPNP / OINP scoring logic
    history.ts            # Static fallback draw history data
scraper/
  scraper.js              # Node.js scraper (curl-based, bypasses Akamai)
public/
  data/history_data.json  # Live draw history (updated by scraper)
  robots.txt
  sitemap.xml
```

---

# 中文版

## 概述

面向加拿大主流移民通道的算分与邀请历史追踪工具。前端采用 **Next.js 15（App Router）+ TypeScript + Tailwind CSS**，支持服务端渲染（SSG/ISR），SEO 友好。Node.js 爬虫每日自动抓取 EE / BCPNP / OINP 官网邀请数据，部署在 Vercel + GitHub Actions。

## 功能

1. 联邦 EE CRS 算分（2026 最新规则，Job Offer 加分已于 2025-03-25 取消）
2. BCPNP Skills Immigration 200 分制算分（规则有效期：2025-12-04）
3. OINP EOI 算分（多 Stream）
4. EE / BCPNP / OINP 邀请历史（每日自动更新）

## 本地运行

```bash
npm install
npm run dev       # http://localhost:3000
```

## 构建

```bash
npm run build
npm run start
```

## 邀请记录抓取

```bash
# 手动抓取一次（更新 data/history_data.json 与 public/data/history_data.json）
npm run scrape:history

# 仅抓取 EE
node scraper/scraper.js --ee
```

## 部署

### Vercel（前端）

Vercel 自动识别 Next.js，直接导入仓库部署，无需额外配置。

- Build Command：`npm run build`
- Output Directory：`.next`

### GitHub Actions（定时爬虫）

工作流位于 `.github/workflows/scrape-history.yml`：

- Schedule：每天 21:00 UTC 自动运行
- 手动触发：`Actions` → `Scrape Immigration History` → `Run workflow`
- 自动提交回仓库：已通过 `permissions: contents: write` 启用

## 目录结构

```
src/
  app/
    layout.tsx            # 根布局：导航、页脚、JSON-LD、OG metadata
    opengraph-image.tsx   # 自动生成 OG 预览图（next/og）
    ee/page.tsx           # 联邦 EE CRS 算分页
    bcpnp/page.tsx        # BCPNP 算分页
    oinp/page.tsx         # OINP EOI 算分页
    ee-history/page.tsx   # EE 邀请历史（ISR 24h）
    bcpnp-history/        # BCPNP 邀请历史（ISR 24h）
    oinp-history/         # OINP 邀请历史（ISR 24h）
  components/
    EECalculator.tsx      # EE 表单 + CRS 分项展示（客户端组件）
    BCPNPCalculator.tsx   # BCPNP 表单 + 分项展示（客户端组件）
    OINPCalculator.tsx    # OINP 表单 + 分项展示（客户端组件）
    HistoryTable.tsx      # 邀请历史表格（服务端组件）
    NavBar.tsx            # 导航栏（含当前路由高亮）
  lib/
    calculators.ts        # EE / BCPNP / OINP 计算逻辑
    history.ts            # 静态兜底邀请历史数据
scraper/
  scraper.js              # Node.js 爬虫（curl 绕过 Akamai TLS 指纹检测）
public/
  data/history_data.json  # 实时邀请数据（由爬虫更新）
  robots.txt
  sitemap.xml
```
