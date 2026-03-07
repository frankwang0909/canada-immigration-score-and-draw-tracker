/**
 * 将从 IRCC 官网复制的 EE 邀请记录导入缓存
 * 数据来源：https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/
 *           policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const CACHE_JSON = path.join(__dirname, '../data/_cache.json');

// 类型标准化
const EE_TYPE_MAP = {
  'canadian experience class': 'CEC',
  'federal skilled worker':    'FSW',
  'federal skilled trades':    'FST',
  'provincial nominee program':'PNP',
  'no program specified':      '全类别',
  'general':                   '全类别',
  'stem occupations':          'STEM',
  'agriculture':               '农业食品',
  'healthcare':                '医疗卫生',
  'social services':           '医疗卫生',
  'physician':                 '医生',
  'french':                    '法语',
  'trade occupations':         '技术工种',
  'transport':                 '运输',
  'education occupations':     '教育',
  'senior managers':           '高管',
};

function normalizeType(raw) {
  const key = raw.trim().toLowerCase();
  for (const [k, v] of Object.entries(EE_TYPE_MAP)) {
    if (key.includes(k)) return v;
  }
  return raw.trim().slice(0, 30);
}

// 直接从官网页面复制的原始数据（#  日期  类型  邀请人数  CRS分数）
const RAW = `
402	March 5, 2026	Senior managers with Canadian Work Experience, 2026-Version 1	250	429
401	March 4, 2026	French-Language proficiency 2026-Version 2	5,500	397
400	March 3, 2026	Canadian Experience Class	4,000	508
399	March 2, 2026	Provincial Nominee Program	264	710
398	February 20, 2026	Healthcare and Social Services Occupations, 2026-Version 3	4,000	467
397	February 19, 2026	Physicians with Canadian Work Experience, 2026-Version 1	391	169
396	February 17, 2026	Canadian Experience Class	6,000	508
395	February 16, 2026	Provincial Nominee Program	279	789
394	February 6, 2026	French-Language proficiency 2026-Version 2	8,500	400
393	February 3, 2026	Provincial Nominee Program	423	749
392	January 21, 2026	Canadian Experience Class	6,000	509
391	January 20, 2026	Provincial Nominee Program	681	746
390	January 7, 2026	Canadian Experience Class	8,000	511
389	January 5, 2026	Provincial Nominee Program	574	711
388	December 17, 2025	French language proficiency (Version 1)	6,000	399
387	December 16, 2025	Canadian Experience Class	5,000	515
386	December 15, 2025	Provincial Nominee Program	399	731
385	December 11, 2025	Healthcare and social services occupations (Version 2)	1,000	476
384	December 10, 2025	Canadian Experience Class	6,000	520
383	December 8, 2025	Provincial Nominee Program	1,123	729
382	November 28, 2025	French language proficiency (Version 1)	6,000	408
381	November 26, 2025	Canadian Experience Class	1,000	531
380	November 25, 2025	Provincial Nominee Program	777	699
379	November 14, 2025	Healthcare and social services occupations (Version 2)	3,500	462
378	November 12, 2025	Canadian Experience Class	1,000	533
377	November 10, 2025	Provincial Nominee Program	714	738
376	October 29, 2025	French language proficiency (Version 1)	6,000	416
375	October 28, 2025	Canadian Experience Class	1,000	533
374	October 27, 2025	Provincial Nominee Program	302	761
373	October 15, 2025	Healthcare and social services occupations (Version 2)	2,500	472
372	October 14, 2025	Provincial Nominee Program	345	778
371	October 6, 2025	French language proficiency (Version 1)	4,500	432
370	October 1, 2025	Canadian Experience Class	1,000	534
369	September 29, 2025	Provincial Nominee Program	291	855
368	September 18, 2025	Trade occupations (Version 2)	1,250	505
367	September 17, 2025	Education occupations (Version 1)	2,500	462
366	September 15, 2025	Provincial Nominee Program	228	746
365	September 4, 2025	French language proficiency (Version 1)	4,500	446
364	September 3, 2025	Canadian Experience Class	1,000	534
363	September 2, 2025	Provincial Nominee Program	249	772
362	August 19, 2025	Healthcare and social services occupations (Version 2)	2,500	470
361	August 18, 2025	Provincial Nominee Program	192	800
360	August 8, 2025	French language proficiency (Version 1)	2,500	481
359	August 7, 2025	Canadian Experience Class	1,000	534
358	August 6, 2025	Provincial Nominee Program	225	739
357	July 22, 2025	Healthcare and social services occupations (Version 2)	4,000	475
356	July 21, 2025	Provincial Nominee Program	202	788
355	July 8, 2025	Canadian Experience Class	3,000	518
354	July 7, 2025	Provincial Nominee Program	356	750
353	June 26, 2025	Canadian Experience Class	3,000	521
352	June 23, 2025	Provincial Nominee Program	503	742
351	June 12, 2025	Canadian Experience Class	3,000	529
350	June 10, 2025	Provincial Nominee Program	125	784
349	June 4, 2025	Healthcare and social services occupations (Version 2)	500	504
348	June 2, 2025	Provincial Nominee Program	277	726
347	May 13, 2025	Canadian Experience Class	500	547
346	May 12, 2025	Provincial Nominee Program	511	706
345	May 2, 2025	Healthcare and social services occupations (Version 2)	500	510
344	May 1, 2025	Education occupations (Version 1)	1,000	479
343	April 28, 2025	Provincial Nominee Program	421	727
342	April 14, 2025	Provincial Nominee Program	825	764
341	March 21, 2025	French language proficiency (Version 1)	7,500	379
340	March 17, 2025	Provincial Nominee Program	536	736
339	March 6, 2025	French language proficiency (Version 1)	4,500	410
338	March 3, 2025	Provincial Nominee Program	725	667
337	February 19, 2025	French language proficiency (Version 1)	6,500	428
336	February 17, 2025	Provincial Nominee Program	646	750
335	February 5, 2025	Canadian Experience Class	4,000	521
334	February 4, 2025	Provincial Nominee Program	455	802
333	January 23, 2025	Canadian Experience Class	4,000	527
332	January 8, 2025	Canadian Experience Class	1,350	542
331	January 7, 2025	Provincial Nominee Program	471	793
`;

const MONTH_MAP = {
  january:'01', february:'02', march:'03', april:'04',
  may:'05', june:'06', july:'07', august:'08',
  september:'09', october:'10', november:'11', december:'12',
};

function parseDate(raw) {
  const m = raw.trim().match(/^(\w+)\s+(\d{1,2}),?\s*(\d{4})/);
  if (!m) return null;
  const month = MONTH_MAP[m[1].toLowerCase()];
  if (!month) return null;
  return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
}

// 解析原始表格文本
const newRecords = [];
for (const line of RAW.trim().split('\n')) {
  const parts = line.split('\t');
  if (parts.length < 5) continue;
  const [, rawDate, rawType, rawInvited, rawCutoff] = parts;
  const date    = parseDate(rawDate.trim());
  if (!date) continue;
  const type    = normalizeType(rawType.trim());
  const invited = parseInt(rawInvited.trim().replace(/,/g, ''), 10);
  const cutoff  = parseInt(rawCutoff.trim(), 10);
  newRecords.push({ date, type, cutoff, invited });
}

// 合并进缓存
const cache = JSON.parse(fs.readFileSync(CACHE_JSON, 'utf8'));
const merged = {};
for (const r of (cache.ee || [])) merged[`${r.date}|${r.type}`] = r;
for (const r of newRecords)       merged[`${r.date}|${r.type}`] = r;  // 新数据优先

cache.ee = Object.values(merged)
  .filter(r => r.date >= '2024-01-01')
  .sort((a, b) => b.date.localeCompare(a.date));

fs.writeFileSync(CACHE_JSON, JSON.stringify(cache, null, 2), 'utf8');
console.log(`导入完成：新增 ${newRecords.length} 条，EE 缓存共 ${cache.ee.length} 条`);
console.log(`最新: ${cache.ee[0].date} ${cache.ee[0].type} cutoff=${cache.ee[0].cutoff}`);
