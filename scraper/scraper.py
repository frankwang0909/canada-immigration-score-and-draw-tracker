#!/usr/bin/env python3
"""
加拿大移民历史邀请数据爬虫
从 IRCC、BC PNP、OINP 官方网站抓取最新邀请记录，
输出到 ../data/history_data.js 供前端直接加载。

用法:
    python scraper.py              # 抓取所有项目
    python scraper.py --ee         # 仅抓取 EE
    python scraper.py --bcpnp      # 仅抓取 BCPNP
    python scraper.py --oinp       # 仅抓取 OINP

定时运行（每天 8:00 AM）crontab 配置:
    0 8 * * * cd /path/to/CanadaImmigration/scraper && .venv/bin/python scraper.py >> scraper.log 2>&1
"""

import argparse
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

# ------------------------------------------------------------------
# 配置
# ------------------------------------------------------------------
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT_JS  = os.path.join(OUTPUT_DIR, "history_data.js")
CACHE_JSON = os.path.join(OUTPUT_DIR, "_cache.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# canada.ca 的 Akamai CDN 会返回 Brotli (br) 压缩，而 requests 声明支持 br 却无法解压，
# 导致连接一直挂起。对 IRCC 请求单独关闭压缩。
HEADERS_NO_BROTLI = {**HEADERS, "Accept-Encoding": "identity"}
REQUEST_TIMEOUT      = 30   # 默认超时（秒）
REQUEST_TIMEOUT_IRCC = 60   # canada.ca 响应慢，单独设置
RETRY_TIMES          = 3
RETRY_DELAY          = 5

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(
            os.path.join(os.path.dirname(__file__), "scraper.log"), encoding="utf-8"
        ),
    ],
)
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# HTTP 工具
# ------------------------------------------------------------------
def fetch_html(url: str) -> BeautifulSoup | None:
    """带重试的 HTTP GET，返回 BeautifulSoup"""
    for attempt in range(1, RETRY_TIMES + 1):
        try:
            logger.info(f"[{attempt}/{RETRY_TIMES}] GET {url}")
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except requests.RequestException as e:
            logger.warning(f"请求失败: {e}")
            if attempt < RETRY_TIMES:
                time.sleep(RETRY_DELAY)
    logger.error(f"所有重试均失败: {url}")
    return None


def fetch_json(url: str, timeout: int = REQUEST_TIMEOUT) -> dict | list | None:
    """带重试的 HTTP GET，返回 JSON"""
    for attempt in range(1, RETRY_TIMES + 1):
        try:
            logger.info(f"[{attempt}/{RETRY_TIMES}] GET(JSON) {url}")
            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            logger.warning(f"请求失败: {e}")
            if attempt < RETRY_TIMES:
                time.sleep(RETRY_DELAY)
        except ValueError as e:
            logger.warning(f"JSON 解析失败: {e}")
            return None
    logger.error(f"所有重试均失败: {url}")
    return None


# ------------------------------------------------------------------
# 日期解析
# ------------------------------------------------------------------
MONTH_MAP = {
    "january": "01", "february": "02", "march": "03", "april": "04",
    "may": "05", "june": "06", "july": "07", "august": "08",
    "september": "09", "october": "10", "november": "11", "december": "12",
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "jun": "06", "jul": "07", "aug": "08", "sep": "09",
    "oct": "10", "nov": "11", "dec": "12",
}

def parse_date(raw: str) -> str | None:
    """多种英文日期格式 → YYYY-MM-DD"""
    raw = re.sub(r"\xa0", " ", raw).strip()  # 替换 non-breaking space
    if re.match(r"\d{4}-\d{2}-\d{2}", raw):
        return raw[:10]
    # "Month D(st/nd/rd/th), YYYY"
    m = re.match(r"(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})", raw, re.I)
    if m:
        month = MONTH_MAP.get(m.group(1).lower())
        if month:
            return f"{m.group(3)}-{month}-{int(m.group(2)):02d}"
    # "D Month YYYY"
    m = re.match(r"(\d{1,2})\s+(\w+)\s+(\d{4})", raw, re.I)
    if m:
        month = MONTH_MAP.get(m.group(2).lower())
        if month:
            return f"{m.group(3)}-{month}-{int(m.group(1)):02d}"
    return None


def parse_int(raw: str) -> int | None:
    cleaned = re.sub(r"[,\s<]", "", raw.strip())
    try:
        return int(cleaned)
    except ValueError:
        return None


# ------------------------------------------------------------------
# 1. EE (IRCC) — 直接读 JSON API
# ------------------------------------------------------------------
IRCC_HTML_URL = (
    "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/"
    "policies-operational-instructions-agreements/ministerial-instructions/"
    "express-entry-rounds.html"
)
IRCC_JSON_URL = (
    "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json"
)

EE_TYPE_MAP = {
    "no program specified":                   "全类别",
    "general":                                "全类别",
    "canadian experience class":              "CEC",
    "federal skilled worker":                 "FSW",
    "federal skilled trades":                 "FST",
    "provincial nominee program":             "PNP",
    "stem occupations":                       "STEM",
    "agriculture":                            "农业食品",
    "healthcare":                             "医疗卫生",
    "french":                                 "法语",
    "trade occupations":                      "技术工种",
    "transport":                              "运输",
    "education":                              "教育",
    "senior managers":                        "高管",
}

def normalize_ee_type(raw: str) -> str:
    key = raw.strip().lower()
    for k, v in EE_TYPE_MAP.items():
        if k in key:
            return v
    # 类别名称较长时截断
    return raw.strip()[:30]


def _curl_get_json(url: str) -> dict | list | None:
    """
    用系统 curl 下载 JSON，绕过 requests 与 Akamai Brotli 压缩的兼容问题。
    canada.ca 对 requests 的 Bot 检测更严格，curl 则可正常访问。
    """
    if not shutil.which("curl"):
        logger.warning("curl 未安装，回退到 requests")
        return None
    for attempt in range(1, RETRY_TIMES + 1):
        logger.info(f"[EE-curl] [{attempt}/{RETRY_TIMES}] {url}")
        try:
            result = subprocess.run(
                [
                    "curl", "-s", "--max-time", str(REQUEST_TIMEOUT),
                    "-H", f"User-Agent: {HEADERS['User-Agent']}",
                    "-H", "Accept-Language: en-US,en;q=0.9",
                    "-H", "Accept: application/json,*/*",
                    url,
                ],
                capture_output=True, text=True, timeout=REQUEST_TIMEOUT + 5,
            )
            if result.returncode != 0:
                logger.warning(f"[EE-curl] curl 退出码 {result.returncode}: {result.stderr[:200]}")
            else:
                return json.loads(result.stdout)
        except subprocess.TimeoutExpired:
            logger.warning("[EE-curl] curl 超时")
        except json.JSONDecodeError as e:
            logger.warning(f"[EE-curl] JSON 解析失败: {e}")
            return None
        if attempt < RETRY_TIMES:
            time.sleep(RETRY_DELAY)
    return None


def scrape_ee() -> list[dict]:
    """
    从 IRCC 获取 EE 历史邀请记录（全量，约 400+ 条）。
    数据来源：IRCC 官方页面背后的 JSON 文件（由 WET 框架动态加载）。
    官方页面：IRCC_HTML_URL
    使用 curl 调用避免 Akamai Bot 检测对 requests 库的限速。
    """
    data = _curl_get_json(IRCC_JSON_URL)

    if not data:
        return []

    rounds = data.get("rounds", [])
    records = []
    for rd in rounds:
        date_str = rd.get("drawDate", "")
        if not re.match(r"\d{4}-\d{2}-\d{2}", date_str):
            date_str = parse_date(rd.get("drawDateFull", ""))
        if not date_str:
            continue

        type_str = normalize_ee_type(rd.get("drawName", ""))
        invited  = parse_int(rd.get("drawSize", ""))
        cutoff   = parse_int(rd.get("drawCRS",  ""))

        if invited:
            records.append({
                "date":    date_str,
                "type":    type_str,
                "cutoff":  cutoff,
                "invited": invited,
            })

    records.sort(key=lambda r: r["date"], reverse=True)
    logger.info(f"EE: 共获取 {len(records)} 条记录（最新：{records[0]['date'] if records else 'N/A'}）")
    return records


# ------------------------------------------------------------------
# 2. BCPNP 爬虫
# ------------------------------------------------------------------
BCPNP_URL = (
    "https://www.welcomebc.ca/immigrate-to-b-c/"
    "about-the-bc-provincial-nominee-program/invitations-to-apply"
)

BCPNP_TYPE_MAP = {
    "tech pilot":        "Tech Pilot",
    "base":              "技术工人/国际毕业生",
    "regional":          "区域移民",
    "skilled worker":    "技术工人",
    "international graduate": "国际毕业生",
    "entry level":       "初级及半熟练",
    "entrepreneur":      "创业移民",
}

def normalize_bcpnp_type(raw: str) -> str:
    key = raw.strip().lower()
    for k, v in BCPNP_TYPE_MAP.items():
        if k in key:
            return v
    return raw.strip() or "BCPNP"


def scrape_bcpnp() -> list[dict]:
    """
    从 WelcomeBC 抓取 BCPNP 邀请记录。
    表格：Date | Stream | Minimum Score | Number of Invitations
    注意：部分行 Date 列为空（共享上一行日期）。
    """
    soup = fetch_html(BCPNP_URL)
    if soup is None:
        return []

    records = []
    for table in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
        if "stream" not in " ".join(headers) and "minimum" not in " ".join(headers):
            continue

        col_date    = next((i for i, h in enumerate(headers) if "date" in h), None)
        col_stream  = next((i for i, h in enumerate(headers) if "stream" in h), None)
        col_score   = next((i for i, h in enumerate(headers) if "score" in h or "minimum" in h), None)
        col_invited = next((i for i, h in enumerate(headers) if "invitation" in h or "number" in h), None)

        if col_date is None:
            continue

        last_date = None
        for tr in table.find_all("tr")[1:]:
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            if not cells:
                continue

            # 处理 Date 列为空（行合并/省略）
            raw_date = cells[col_date] if col_date < len(cells) else ""
            if raw_date:
                parsed = parse_date(raw_date)
                if parsed:
                    last_date = parsed
            date_str = last_date
            if not date_str:
                continue

            stream   = normalize_bcpnp_type(cells[col_stream]) if col_stream is not None and col_stream < len(cells) else "BCPNP"
            cutoff   = parse_int(cells[col_score])   if col_score   is not None and col_score   < len(cells) else None
            invited  = parse_int(cells[col_invited]) if col_invited is not None and col_invited < len(cells) else None

            records.append({
                "date":    date_str,
                "type":    stream,
                "cutoff":  cutoff,
                "invited": invited or 0,
            })

    records.sort(key=lambda r: r["date"], reverse=True)
    logger.info(f"BCPNP: 共获取 {len(records)} 条记录（最新：{records[0]['date'] if records else 'N/A'}）")
    return records


# ------------------------------------------------------------------
# 3. OINP 爬虫（两个页面合并）
# ------------------------------------------------------------------
OINP_PAGES = [
    # (URL, 主要用途, type前缀)
    (
        "https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp-invitations-apply",
        "ita",   # Invitation to Apply
    ),
    (
        "https://www.ontario.ca/page/oinp-express-entry-notifications-interest",
        "eoi",   # Expression of Interest / NOI
    ),
]

OINP_TYPE_MAP = {
    "skilled trades":         "紧缺技能",
    "physician":              "医生",
    "redi":                   "区域经济发展",
    "human capital":          "人力资本优先(HCP)",
    "hcp":                    "人力资本优先(HCP)",
    "employer job offer":     "雇主担保",
    "international student":  "雇主担保-国际学生",
    "foreign worker":         "雇主担保-外国工人",
    "masters graduate":       "硕士毕业生",
    "phd":                    "博士毕业生",
    "doctoral":               "博士毕业生",
    "french":                 "法语技术工人",
    "tech":                   "科技类",
    "express entry":          "联邦EE对接",
    "noi":                    "联邦EE通知",
}

def normalize_oinp_type(raw: str, page_type: str = "") -> str:
    key = raw.strip().lower()
    for k, v in OINP_TYPE_MAP.items():
        if k in key:
            return v
    if page_type == "eoi":
        return "联邦EE通知"
    return raw.strip()[:40] or "OINP"


def _parse_oinp_table(table, page_type: str, stream_name: str = "") -> list[dict]:
    """解析单张 OINP 表格，返回记录列表"""
    headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
    if not headers:
        return []

    col_date    = next((i for i, h in enumerate(headers) if "date" in h), None)
    col_invited = next((i for i, h in enumerate(headers)
                        if "invitation" in h or "noi" in h or "number" in h), None)
    col_score   = next((i for i, h in enumerate(headers)
                        if "score" in h or "crs" in h or "range" in h), None)
    col_notes   = next((i for i, h in enumerate(headers) if "note" in h), None)

    if col_date is None:
        return []

    records = []
    last_date = None
    for tr in table.find_all("tr")[1:]:
        cells = [td.get_text(" ", strip=True) for td in tr.find_all(["td", "th"])]
        if not cells:
            continue

        raw_date = cells[col_date] if col_date < len(cells) else ""
        # 取第一个日期（有些格子写 "Feb 18, 2026"）
        date_match = re.search(r"(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})", raw_date)
        if date_match:
            parsed = parse_date(date_match.group(1))
            if parsed:
                last_date = parsed
        date_str = last_date
        if not date_str:
            continue

        invited_raw = cells[col_invited] if col_invited is not None and col_invited < len(cells) else ""
        invited = parse_int(invited_raw)

        # Score: OINP 通常给分数范围如 "50 and above" 或 "505-528"
        # 取范围下限作为 cutoff
        cutoff = None
        if col_score is not None and col_score < len(cells):
            score_text = cells[col_score]
            nums = re.findall(r"\d+", score_text)
            if nums:
                cutoff = int(nums[0])

        # 从 notes 列推断类型
        notes = cells[col_notes].lower() if col_notes is not None and col_notes < len(cells) else ""
        if stream_name:
            type_str = normalize_oinp_type(stream_name, page_type)
        elif notes:
            type_str = normalize_oinp_type(notes, page_type)
        else:
            type_str = "联邦EE通知" if page_type == "eoi" else "OINP"

        records.append({
            "date":    date_str,
            "type":    type_str,
            "cutoff":  cutoff,
            "invited": invited or 0,
        })
    return records


def scrape_oinp() -> list[dict]:
    """从两个 OINP 页面抓取邀请/通知记录"""
    all_records = []

    for url, page_type in OINP_PAGES:
        soup = fetch_html(url)
        if soup is None:
            continue

        tables = soup.find_all("table")
        logger.info(f"OINP [{page_type}] {url}: {len(tables)} 张表")

        for table in tables:
            # 尝试从表格前面的标题推断流程名称
            heading = table.find_previous(["h2", "h3", "h4", "caption"])
            stream_name = heading.get_text(strip=True) if heading else ""
            records = _parse_oinp_table(table, page_type, stream_name)
            all_records.extend(records)

    # 去重（同一 date+type 保留 invited 最大的）
    dedup = {}
    for r in all_records:
        key = f"{r['date']}|{r['type']}"
        if key not in dedup or (r["invited"] or 0) > (dedup[key]["invited"] or 0):
            dedup[key] = r

    result = sorted(dedup.values(), key=lambda r: r["date"], reverse=True)
    logger.info(f"OINP: 共获取 {len(result)} 条记录（最新：{result[0]['date'] if result else 'N/A'}）")
    return result


# ------------------------------------------------------------------
# 缓存：合并历史数据
# ------------------------------------------------------------------
def load_cache() -> dict:
    if os.path.exists(CACHE_JSON):
        try:
            with open(CACHE_JSON, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_cache(cache: dict) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(CACHE_JSON, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def merge(program: str, cache: dict, new_records: list[dict]) -> list[dict]:
    """新数据优先，与缓存合并去重"""
    merged = {f"{r['date']}|{r['type']}": r for r in cache.get(program, [])}
    for r in new_records:
        merged[f"{r['date']}|{r['type']}"] = r
    result = sorted(merged.values(), key=lambda r: r["date"], reverse=True)
    cache[program] = result
    return result


# ------------------------------------------------------------------
# 输出 JS 文件
# ------------------------------------------------------------------
def write_js(ee: list[dict], bcpnp: list[dict], oinp: list[dict]) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    def to_js(records: list[dict]) -> str:
        lines = []
        for r in records:
            cutoff = r["cutoff"] if r["cutoff"] is not None else "null"
            lines.append(
                f'  {{"date":"{r["date"]}","type":"{r["type"]}",'
                f'"cutoff":{cutoff},"invited":{r["invited"]}}}'
            )
        return "[\n" + ",\n".join(lines) + "\n]"

    content = f"""\
// Auto-generated by scraper.py — Last updated: {now}
// Do NOT edit manually. Run: python scraper/scraper.py

var LIVE_EE_HISTORY    = {to_js(ee)};
var LIVE_BCPNP_HISTORY = {to_js(bcpnp)};
var LIVE_OINP_HISTORY  = {to_js(oinp)};
var LIVE_DATA_UPDATED  = "{now}";
"""
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(content)
    logger.info(f"输出: {OUTPUT_JS}")
    logger.info(f"  EE={len(ee)} 条  BCPNP={len(bcpnp)} 条  OINP={len(oinp)} 条")


# ------------------------------------------------------------------
# 主程序
# ------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="加拿大移民历史邀请数据爬虫")
    parser.add_argument("--ee",    action="store_true", help="仅抓取联邦 EE")
    parser.add_argument("--bcpnp", action="store_true", help="仅抓取 BCPNP")
    parser.add_argument("--oinp",  action="store_true", help="仅抓取 OINP")
    args = parser.parse_args()
    run_all = not (args.ee or args.bcpnp or args.oinp)

    cache = load_cache()

    if run_all or args.ee:
        fresh = scrape_ee()
        if fresh:
            cache["ee"] = merge("ee", cache, fresh)
        else:
            logger.warning("EE 无新数据，保留缓存")

    if run_all or args.bcpnp:
        fresh = scrape_bcpnp()
        if fresh:
            cache["bcpnp"] = merge("bcpnp", cache, fresh)
        else:
            logger.warning("BCPNP 无新数据，保留缓存")

    if run_all or args.oinp:
        fresh = scrape_oinp()
        if fresh:
            cache["oinp"] = merge("oinp", cache, fresh)
        else:
            logger.warning("OINP 无新数据，保留缓存")

    save_cache(cache)
    write_js(
        cache.get("ee",    []),
        cache.get("bcpnp", []),
        cache.get("oinp",  []),
    )
    logger.info("全部完成 ✓")


if __name__ == "__main__":
    main()
