#!/usr/bin/env node
/**
 * 加拿大移民历史邀请数据爬虫 (Node.js 版)
 *
 * 用法:
 *   node scraper.js           # 抓取所有
 *   node scraper.js --ee      # 仅 EE
 *   node scraper.js --bcpnp   # 仅 BCPNP
 *   node scraper.js --oinp    # 仅 OINP
 *
 * 定时运行（每天 8:00 AM）crontab 配置:
 *   0 8 * * * cd /path/to/CanadaImmigration/scraper && node scraper.js >> scraper.log 2>&1
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const { execFile } = require('child_process');
const axios   = require('axios');
const cheerio = require('cheerio');

// ------------------------------------------------------------------
// 配置
// ------------------------------------------------------------------
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_JS  = path.join(OUTPUT_DIR, 'history_data.js');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'history_data.json');
const PUBLIC_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const PUBLIC_OUTPUT_JSON = path.join(PUBLIC_OUTPUT_DIR, 'history_data.json');
const CACHE_JSON = path.join(OUTPUT_DIR, '_cache.json');

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};


const DATE_FROM    = '2024-01-01'; // 只输出此日期之后的记录

const RETRY_TIMES  = 3;
const RETRY_DELAY  = 5000;  // ms
const TIMEOUT      = 30000; // ms
const TIMEOUT_CURL = 60000; // ms — curl 获取较大文件时用

// ------------------------------------------------------------------
// 日志
// ------------------------------------------------------------------
const logStream = fs.createWriteStream(path.join(__dirname, 'scraper.log'), { flags: 'a' });

function log(level, msg) {
  const ts   = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const line = `${ts} [${level}] ${msg}`;
  console.log(line);
  logStream.write(line + '\n');
}

const logger = {
  info:    msg => log('INFO',    msg),
  warning: msg => log('WARNING', msg),
  error:   msg => log('ERROR',   msg),
};

// ------------------------------------------------------------------
// HTTP 工具
// ------------------------------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  for (let i = 1; i <= RETRY_TIMES; i++) {
    try {
      logger.info(`[${i}/${RETRY_TIMES}] GET ${url}`);
      const resp = await axios.get(url, { headers: HEADERS, timeout: TIMEOUT });
      return cheerio.load(resp.data);
    } catch (e) {
      logger.warning(`请求失败: ${e.message}`);
      if (i < RETRY_TIMES) await sleep(RETRY_DELAY);
    }
  }
  logger.error(`所有重试均失败: ${url}`);
  return null;
}

// canada.ca Akamai CDN 会拦截 Node.js 的 TLS 指纹，改用系统 curl 绕过
function fetchJsonCurl(url) {
  return new Promise((resolve) => {
    const args = ['-s', '--max-time', String(TIMEOUT_CURL / 1000), url];
    let attempt = 0;
    const run = () => {
      attempt++;
      logger.info(`[${attempt}/${RETRY_TIMES}] GET(curl) ${url}`);
      execFile('curl', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err) {
          logger.warning(`请求失败: ${err.message}`);
          if (attempt < RETRY_TIMES) return setTimeout(run, RETRY_DELAY);
          logger.error(`所有重试均失败: ${url}`);
          return resolve(null);
        }
        try { resolve(JSON.parse(stdout)); }
        catch (e) { logger.error(`JSON 解析失败: ${e.message}`); resolve(null); }
      });
    };
    run();
  });
}


// ------------------------------------------------------------------
// 日期 / 数字解析
// ------------------------------------------------------------------
const MONTH_MAP = {
  january:'01', february:'02', march:'03',    april:'04',
  may:'05',     june:'06',     july:'07',      august:'08',
  september:'09', october:'10', november:'11', december:'12',
  jan:'01', feb:'02', mar:'03', apr:'04',
  jun:'06', jul:'07', aug:'08', sep:'09',
  oct:'10', nov:'11', dec:'12',
};

function parseDate(raw) {
  if (!raw) return null;
  raw = raw.replace(/\xa0/g, ' ').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  // "Month D(st/nd/rd/th), YYYY"
  let m = raw.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i);
  if (m) {
    const month = MONTH_MAP[m[1].toLowerCase()];
    if (month) return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
  }

  // "D Month YYYY"
  m = raw.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (m) {
    const month = MONTH_MAP[m[2].toLowerCase()];
    if (month) return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }

  return null;
}

function parseNum(raw, { allowLessThan = false } = {}) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!allowLessThan && str.includes('<')) return null;
  const n = parseInt(str.replace(/[,\s<]/g, ''), 10);
  return isNaN(n) ? null : n;
}

function normalizeRecord(program, record) {
  const next = { ...record };
  if (typeof next.type === 'string') next.type = next.type.trim();
  if (next.invited !== null && next.invited !== undefined) {
    if (!Number.isFinite(next.invited) || next.invited <= 0) next.invited = null;
  } else {
    next.invited = null;
  }
  if (next.cutoff !== null && next.cutoff !== undefined && !Number.isFinite(next.cutoff)) {
    next.cutoff = null;
  }
  if (program === 'ee' && next.invited === null) return null; // EE 官方数据应始终有邀请人数
  return next;
}

function recordCoreKey(record) {
  return `${record.date}|${record.type}|${record.cutoff ?? 'null'}`;
}

function pickBetterRecord(a, b) {
  const aInvited = a.invited ?? -1;
  const bInvited = b.invited ?? -1;
  if (bInvited > aInvited) return b;
  return a;
}

// ------------------------------------------------------------------
// 1. EE (IRCC JSON API, via curl to bypass Akamai TLS fingerprinting)
// ------------------------------------------------------------------
const IRCC_JSON_URL = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';

const EE_TYPE_MAP = {
  'no program specified':      '全类别',
  'general':                   '全类别',
  'canadian experience class': 'CEC',
  'federal skilled worker':    'FSW',
  'federal skilled trades':    'FST',
  'provincial nominee program':'PNP',
  'stem occupations':          'STEM',
  'agriculture':               '农业食品',
  'healthcare':                '医疗卫生',
  'french':                    '法语',
  'trade occupations':         '技术工种',
  'transport':                 '运输',
  'education':                 '教育',
  'senior managers':           '高管',
};

function normalizeEeType(raw) {
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(EE_TYPE_MAP)) {
    if (key.includes(k)) return v;
  }
  return raw.trim().slice(0, 30);
}

async function scrapeEe() {
  const data = await fetchJsonCurl(IRCC_JSON_URL);
  if (!data) return [];

  const records = [];
  for (const rd of (data.rounds || [])) {
    let dateStr = rd.drawDate || '';
    if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      dateStr = parseDate(rd.drawDateFull || '') || '';
    }
    if (!dateStr) continue;

    const invited = parseNum(String(rd.drawSize || ''));
    const cutoff  = parseNum(String(rd.drawCRS  || ''));
    if (invited) {
      records.push({ date: dateStr, type: normalizeEeType(rd.drawName || ''), cutoff, invited });
    }
  }

  records.sort((a, b) => b.date.localeCompare(a.date));
  logger.info(`EE: 共获取 ${records.length} 条记录（最新：${records[0]?.date || 'N/A'}）`);
  return records;
}

// ------------------------------------------------------------------
// 2. BCPNP
// ------------------------------------------------------------------
const BCPNP_URL = 'https://www.welcomebc.ca/immigrate-to-b-c/about-the-bc-provincial-nominee-program/invitations-to-apply';

const BCPNP_TYPE_MAP = {
  'tech pilot':             'Tech Pilot',
  'base':                   '创业移民(Base)',
  'regional pilot':         '创业移民(区域)',
  'regional':               '创业移民(区域)',
  'skilled worker':         '技术工人',
  'international graduate': '国际毕业生',
  'entry level':            '初级及半熟练',
  'entrepreneur':           '创业移民',
};

function normalizeBcpnpType(raw) {
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(BCPNP_TYPE_MAP)) {
    if (key.includes(k)) return v;
  }
  return raw.trim() || 'BCPNP';
}

async function scrapeBcpnp() {
  const $ = await fetchHtml(BCPNP_URL);
  if (!$) return [];

  const records = [];

  // --- 1. EI 表格：Date | Stream | Minimum Score | Number of Invitations ---
  $('table').each((_, table) => {
    const headers = [];
    $(table).find('th').each((_, th) => headers.push($(th).text().trim().toLowerCase()));

    const hStr = headers.join(' ');
    if (!hStr.includes('stream') && !hStr.includes('minimum')) return;

    const colDate    = headers.findIndex(h => h.includes('date'));
    const colStream  = headers.findIndex(h => h.includes('stream'));
    const colScore   = headers.findIndex(h => h.includes('score') || h.includes('minimum'));
    const colInvited = headers.findIndex(h => h.includes('invitation') || h.includes('number'));

    if (colDate === -1) return;

    let lastDate = null;
    $(table).find('tr').slice(1).each((_, tr) => {
      const cells = $(tr).find('td, th').map((_, td) => $(td).text().trim()).get();
      if (!cells.length) return;
      let offset = 0;
      let dateStr = lastDate;

      if (colDate === 0 && cells[0]) {
        const parsed = parseDate(cells[0]);
        if (parsed) {
          dateStr = parsed;
          lastDate = parsed;
          offset = 1;
        }
      } else if (colDate !== -1 && colDate < cells.length && cells[colDate]) {
        const parsed = parseDate(cells[colDate]);
        if (parsed) {
          dateStr = parsed;
          lastDate = parsed;
        }
      }

      if (!dateStr) return;

      const readCell = (col) => {
        if (col === -1) return '';
        const idx = (colDate === 0 && offset === 0) ? col - 1 : col;
        return idx >= 0 && idx < cells.length ? cells[idx] : '';
      };

      const stream  = normalizeBcpnpType(readCell(colStream)) || 'BCPNP';
      const cutoff  = parseNum(readCell(colScore), { allowLessThan: true });
      const invited = parseNum(readCell(colInvited));

      records.push({ date: dateStr, type: stream, cutoff, invited });
    });
  });

  // --- 2. SI 叙述格式（accordion 面板，非表格） ---
  // 格式："On [date], the BC PNP issued invitations to apply to [X] candidates...
  //        minimum score of [Y] points ([Z] candidates)"
  const bodyText = $.root().text();
  const narrativeRe = /On\s+([A-Z][a-z]+ \d{1,2},?\s*\d{4})[^]*?issued invitations to apply to (\d+) candidates[^]*?minimum score of (\d+) points \((\d+) candidates\)/gi;
  let nm;
  while ((nm = narrativeRe.exec(bodyText)) !== null) {
    const date = parseDate(nm[1]);
    if (!date) continue;
    records.push({
      date,
      type:    'Tech Pilot',
      cutoff:  parseInt(nm[3], 10),
      invited: parseInt(nm[4], 10),
    });
  }

  records.sort((a, b) => b.date.localeCompare(a.date));
  logger.info(`BCPNP: 共获取 ${records.length} 条记录（最新：${records[0]?.date || 'N/A'}）`);
  return records;
}

// ------------------------------------------------------------------
// 2b. BCPNP PDF 档案（2024 / 2025 年历史数据）
// ------------------------------------------------------------------
const { PDFParse, VerbosityLevel } = require('pdf-parse');

const BCPNP_PDF_URLS = [
  { url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-invitations-to-apply-si-2025-pdf', fmt: 'SI-narrative' },
  { url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-invitations-to-apply-si-2024-pdf', fmt: 'SI-table'     },
  { url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-invitations-to-apply-ei-2025-pdf', fmt: 'EI-table'     },
  { url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-invitations-to-apply-ei-2024-pdf', fmt: 'EI-table'     },
];

async function getPdfText(url) {
  const resp = await axios.get(url, {
    responseType:  'arraybuffer',
    timeout:       TIMEOUT,
    headers:       { 'User-Agent': HEADERS['User-Agent'] },
  });
  const p = new PDFParse({ verbosity: VerbosityLevel.ERRORS, data: new Uint8Array(Buffer.from(resp.data)) });
  await p.load();
  let text = '';
  for (let i = 1; i <= p.doc.numPages; i++) {
    const page    = await p.doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(x => x.str).join(' ') + '\n';
  }
  return text;
}

/** 清理 PDF 文本：合并断行、修复被拆分的月份名和数字 */
function normalizePdfText(text) {
  return text
    .replace(/\s+/g, ' ')
    // 修复被空格拆开的月份名（"Dec ember" → "December"）
    .replace(/\b(Jan)\s+(uary)\b/gi, 'January')
    .replace(/\b(Feb)\s+(ruary)\b/gi, 'February')
    .replace(/\b(Mar)\s+(ch)\b/gi, 'March')
    .replace(/\b(Apr)\s+(il)\b/gi, 'April')
    .replace(/\b(Jun)\s+(e)\b/gi, 'June')
    .replace(/\b(Jul)\s+(y)\b/gi, 'July')
    .replace(/\b(Aug)\s+(ust)\b/gi, 'August')
    .replace(/\b(Sep)\s+(tember)\b/gi, 'September')
    .replace(/\b(Oct)\s+(ober)\b/gi, 'October')
    .replace(/\b(Nov)\s+(ember)\b/gi, 'November')
    .replace(/\b(Dec)\s+(ember)\b/gi, 'December')
    // 修复被拆开的四位数年份（"202 4" → "2024"）
    .replace(/\b(20[0-9])\s+([0-9])\b/g, '$1$2')
    // 修复被拆开的两位+一位数字（"11 5" → "115", "12 1" → "121"）
    .replace(/\b(\d{2})\s+(\d)\b(?!\s*\d)/g, '$1$2');
}

/** 解析 EI PDF（2024 / 2025）：干净的 Date | Stream | Score | Count 表格 */
function parseEiPdfText(text) {
  const t = normalizePdfText(text);
  const records = [];

  // 按日期分块
  const DATE_RE = /([A-Z][a-z]+ \d{1,2},?\s*\d{4})/g;
  const dateMatches = [];
  let m;
  while ((m = DATE_RE.exec(t)) !== null) {
    const d = parseDate(m[1]);
    if (d) dateMatches.push({ date: d, idx: m.index + m[0].length });
  }

  for (let i = 0; i < dateMatches.length; i++) {
    const { date, idx } = dateMatches[i];
    const blockEnd = i + 1 < dateMatches.length ? dateMatches[i + 1].idx - 20 : t.length;
    const block = t.slice(idx, blockEnd);

    // 每行：[Stream] [Score] [Count or <5]
    // Base / Regional / Regional Pilot
    const rowRe = /(Base|Regional(?:\s+Pilot)?)\s+(\d{2,3})\s+(<?\d+)/gi;
    let rm;
    while ((rm = rowRe.exec(block)) !== null) {
      const streamRaw = rm[1].toLowerCase();
      const type    = streamRaw.includes('regional') ? '创业移民(区域)' : '创业移民(Base)';
      const cutoff  = parseInt(rm[2], 10);
      const invited = rm[3].startsWith('<') ? null : parseInt(rm[3], 10);
      records.push({ date, type, cutoff, invited });
    }
  }

  return records;
}

/** 解析 SI 2025 PDF（叙述格式）：Tech Pilot 高经济影响力抽签 */
function parseSi2025PdfText(text) {
  const t = normalizePdfText(text);
  const records = [];

  // "On [date], the BC PNP issued invitations to apply to [X] candidates"
  // "minimum score of [Y] points ([Z] candidates)"
  const blockRe = /On\s+([A-Z][a-z]+ \d{1,2},?\s*\d{4})[^]*?issued invitations to apply to (\d+) candidates[^]*?minimum score of (\d+) points \((\d+) candidates\)/gi;
  let m;
  while ((m = blockRe.exec(t)) !== null) {
    const date    = parseDate(m[1]);
    if (!date) continue;
    const invited = parseInt(m[4], 10);
    const cutoff  = parseInt(m[3], 10);
    records.push({ date, type: 'Tech Pilot', cutoff, invited });
  }

  return records;
}

/** 解析 SI 2024 PDF（表格格式，提取关键抽签类型） */
function parseSi2024PdfText(text) {
  const t = normalizePdfText(text);
  const records = [];

  const DATE_RE = /([A-Z][a-z]+ \d{1,2},?\s*\d{4})/g;
  const dateMatches = [];
  let m;
  while ((m = DATE_RE.exec(t)) !== null) {
    const d = parseDate(m[1]);
    if (d) dateMatches.push({ date: d, idx: m.index + m[0].length });
  }

  for (let i = 0; i < dateMatches.length; i++) {
    const { date, idx } = dateMatches[i];
    const blockEnd = i + 1 < dateMatches.length ? dateMatches[i + 1].idx - 20 : t.length;
    const block = t.slice(idx, blockEnd);

    // General 抽签（技术工人 / 国际毕业生）
    const generalRe = /General\s+Skilled Worker\s+(\d{2,3})\s+(<?\d+)/i;
    const gm = block.match(generalRe);
    if (gm) {
      const invited = gm[2].startsWith('<') ? null : parseInt(gm[2], 10);
      records.push({ date, type: '技术工人', cutoff: parseInt(gm[1], 10), invited });
    }

    // Tech 抽签
    const techRe = /\bTech\b\s+(\d{2,3})\s+(<?\d+)/i;
    const tm = block.match(techRe);
    if (tm) {
      const invited = tm[2].startsWith('<') ? null : parseInt(tm[2], 10);
      records.push({ date, type: 'Tech Pilot', cutoff: parseInt(tm[1], 10), invited });
    }

    // Healthcare 抽签
    const healthRe = /Healthcare\s+(\d{2,3})\s+(<?\d+)/i;
    const hm = block.match(healthRe);
    if (hm) {
      const invited = hm[2].startsWith('<') ? null : parseInt(hm[2], 10);
      records.push({ date, type: '医疗卫生', cutoff: parseInt(hm[1], 10), invited });
    }

    // Entry Level & Semi-Skilled
    const entryRe = /Entry Level[^0-9]+(\d{2,3})(?:\s+(<?\d+))?/i;
    const em = block.match(entryRe);
    if (em && gm) { // 只在有 General 抽签时才记录（避免误匹配）
      const cutoff = parseInt(em[1], 10);
      records.push({ date, type: '初级及半熟练', cutoff, invited: null });
    }
  }

  return records;
}

async function scrapeBcpnpPdfs() {
  const allRecords = [];

  for (const { url, fmt } of BCPNP_PDF_URLS) {
    try {
      logger.info(`[BCPNP-PDF] ${fmt}: ${url}`);
      const text = await getPdfText(url);
      let recs = [];
      if (fmt === 'SI-narrative') recs = parseSi2025PdfText(text);
      else if (fmt === 'SI-table') recs = parseSi2024PdfText(text);
      else if (fmt === 'EI-table') recs = parseEiPdfText(text);
      logger.info(`[BCPNP-PDF] ${fmt}: 解析到 ${recs.length} 条`);
      allRecords.push(...recs);
    } catch (e) {
      logger.warning(`[BCPNP-PDF] ${fmt} 失败: ${e.message}`);
    }
  }

  return allRecords;
}

// ------------------------------------------------------------------
// 3. OINP（两个页面）
// ------------------------------------------------------------------
const OINP_PAGES = [
  { url: 'https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp-invitations-apply', type: 'ita' },
  { url: 'https://www.ontario.ca/page/oinp-express-entry-notifications-interest',                type: 'eoi' },
];

const OINP_TYPE_MAP = {
  'skilled trades':        '紧缺技能',
  'physician':             '医生',
  'redi':                  '区域经济发展',
  'human capital':         '人力资本优先(HCP)',
  'hcp':                   '人力资本优先(HCP)',
  'employer job offer':    '雇主担保',
  'international student': '雇主担保-国际学生',
  'foreign worker':        '雇主担保-外国工人',
  'masters graduate':      '硕士毕业生',
  'phd':                   '博士毕业生',
  'doctoral':              '博士毕业生',
  'french':                '法语技术工人',
  'tech':                  '科技类',
  'express entry':         '联邦EE对接',
  'noi':                   '联邦EE通知',
};

function normalizeOinpType(raw, pageType = '') {
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(OINP_TYPE_MAP)) {
    if (key.includes(k)) return v;
  }
  if (pageType === 'eoi') return '联邦EE通知';
  return raw.trim().slice(0, 40) || 'OINP';
}

function parseOinpTable($, table, pageType, streamName = '') {
  const headers = [];
  $(table).find('th').each((_, th) => headers.push($(th).text().trim().toLowerCase()));
  if (!headers.length) return [];

  const colDate    = headers.findIndex(h => h.includes('date'));
  const colInvited = headers.findIndex(h => h.includes('invitation') || h.includes('noi') || h.includes('number'));
  const colScore   = headers.findIndex(h => h.includes('score') || h.includes('crs') || h.includes('range'));
  const colNotes   = headers.findIndex(h => h.includes('note'));

  if (colDate === -1) return [];

  const records = [];
  let lastDate = null;

  $(table).find('tr').slice(1).each((_, tr) => {
    const cells = $(tr).find('td, th').map((_, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    if (!cells.length) return;

    const rawDate = colDate < cells.length ? cells[colDate] : '';
    const dateMatch = rawDate.match(/(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const parsed = parseDate(dateMatch[1]);
      if (parsed) lastDate = parsed;
    }
    if (!lastDate) return;

    const invited = colInvited !== -1 && colInvited < cells.length ? parseNum(cells[colInvited]) : null;

    let cutoff = null;
    if (colScore !== -1 && colScore < cells.length) {
      const nums = cells[colScore].match(/\d+/g);
      if (nums) cutoff = parseInt(nums[0], 10);
    }

    const notes = colNotes !== -1 && colNotes < cells.length ? cells[colNotes].toLowerCase() : '';
    let typeStr;
    if (streamName) typeStr = normalizeOinpType(streamName, pageType);
    else if (notes) typeStr = normalizeOinpType(notes, pageType);
    else            typeStr = pageType === 'eoi' ? '联邦EE通知' : 'OINP';

    records.push({ date: lastDate, type: typeStr, cutoff, invited });
  });

  return records;
}

async function scrapeOinp() {
  const allRecords = [];

  for (const { url, type: pageType } of OINP_PAGES) {
    const $ = await fetchHtml(url);
    if (!$) continue;

    const tables = $('table').toArray();
    logger.info(`OINP [${pageType}] ${url}: ${tables.length} 张表`);

    for (const table of tables) {
      const heading    = $(table).prevAll('h2, h3, h4, caption').first();
      const streamName = heading.length ? heading.text().trim() : '';
      allRecords.push(...parseOinpTable($, table, pageType, streamName));
    }
  }

  // 去重（同 date|type|cutoff|invited 视为同一条）
  const dedup = {};
  for (const r of allRecords) {
    const normalized = normalizeRecord('oinp', r);
    if (!normalized) continue;
    const key = recordCoreKey(normalized);
    dedup[key] = dedup[key] ? pickBetterRecord(dedup[key], normalized) : normalized;
  }

  const result = Object.values(dedup).sort((a, b) => b.date.localeCompare(a.date));
  logger.info(`OINP: 共获取 ${result.length} 条记录（最新：${result[0]?.date || 'N/A'}）`);
  return result;
}

// ------------------------------------------------------------------
// 缓存
// ------------------------------------------------------------------
function loadCache() {
  try {
    if (fs.existsSync(CACHE_JSON)) {
      return JSON.parse(fs.readFileSync(CACHE_JSON, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function saveCache(cache) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(CACHE_JSON, JSON.stringify(cache, null, 2), 'utf8');
}

function mergeRecords(program, cache, newRecords) {
  const merged = {};
  for (const r of (cache[program] || [])) {
    const normalized = normalizeRecord(program, r);
    if (!normalized) continue;
    const key = recordCoreKey(normalized);
    merged[key] = merged[key] ? pickBetterRecord(merged[key], normalized) : normalized;
  }
  for (const r of newRecords) {
    const normalized = normalizeRecord(program, r);
    if (!normalized) continue;
    const key = recordCoreKey(normalized);
    merged[key] = merged[key] ? pickBetterRecord(merged[key], normalized) : normalized;
  }
  const result = Object.values(merged)
    .filter(r => r.date >= DATE_FROM)
    .sort((a, b) => b.date.localeCompare(a.date));
  cache[program] = result;
  return result;
}

// ------------------------------------------------------------------
// 输出 JS 文件
// ------------------------------------------------------------------
function writeJs(ee, bcpnp, oinp) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  function toJs(records) {
    const lines = records.map(r => {
      const cutoff = (r.cutoff !== null && r.cutoff !== undefined) ? r.cutoff : 'null';
      const invited = (r.invited !== null && r.invited !== undefined) ? r.invited : 'null';
      return `  {"date":"${r.date}","type":"${r.type}","cutoff":${cutoff},"invited":${invited}}`;
    });
    return '[\n' + lines.join(',\n') + '\n]';
  }

  const filter = r => r.date >= DATE_FROM;

  const content =
`// Auto-generated by scraper.js — Last updated: ${now}
// Do NOT edit manually. Run: node scraper/scraper.js

var LIVE_EE_HISTORY    = ${toJs(ee.filter(filter))};
var LIVE_BCPNP_HISTORY = ${toJs(bcpnp.filter(filter))};
var LIVE_OINP_HISTORY  = ${toJs(oinp.filter(filter))};
var LIVE_DATA_UPDATED  = "${now}";
`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_JS, content, 'utf8');
  const jsonContent = JSON.stringify(
    {
      updated: now,
      ee: ee.filter(filter),
      bcpnp: bcpnp.filter(filter),
      oinp: oinp.filter(filter),
    },
    null,
    2
  );
  fs.writeFileSync(
    OUTPUT_JSON,
    jsonContent,
    'utf8'
  );
  fs.writeFileSync(
    PUBLIC_OUTPUT_JSON,
    jsonContent,
    'utf8'
  );
  logger.info(`输出: ${OUTPUT_JS}`);
  logger.info(`输出: ${OUTPUT_JSON}`);
  logger.info(`输出: ${PUBLIC_OUTPUT_JSON}`);
  logger.info(`  EE=${ee.filter(filter).length} 条  BCPNP=${bcpnp.filter(filter).length} 条  OINP=${oinp.filter(filter).length} 条（${DATE_FROM} 至今）`);
}

// ------------------------------------------------------------------
// 主程序
// ------------------------------------------------------------------
async function main() {
  const args   = process.argv.slice(2);
  const runAll = !args.includes('--ee') && !args.includes('--bcpnp') && !args.includes('--oinp');

  const cache = loadCache();

  if (runAll || args.includes('--ee')) {
    const fresh = await scrapeEe();
    if (fresh.length) mergeRecords('ee', cache, fresh);
    else logger.warning('EE 无新数据，保留缓存');
  }

  if (runAll || args.includes('--bcpnp')) {
    const [liveRecs, pdfRecs] = await Promise.all([scrapeBcpnp(), scrapeBcpnpPdfs()]);
    const fresh = [...liveRecs, ...pdfRecs];
    if (fresh.length) mergeRecords('bcpnp', cache, fresh);
    else logger.warning('BCPNP 无新数据，保留缓存');
  }

  if (runAll || args.includes('--oinp')) {
    const fresh = await scrapeOinp();
    if (fresh.length) mergeRecords('oinp', cache, fresh);
    else logger.warning('OINP 无新数据，保留缓存');
  }

  saveCache(cache);
  writeJs(cache.ee || [], cache.bcpnp || [], cache.oinp || []);
  logger.info('全部完成 ✓');
}

main().catch(e => {
  logger.error(`未处理异常: ${e.message}`);
  process.exit(1);
});
