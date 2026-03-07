// ============================================================
// app.js — UI 交互、Tab 切换、图表渲染
// ============================================================

// ----------------------------------------------------------
// Tab 切换
// ----------------------------------------------------------
(function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-panel');

  function activate(tabId) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    panels.forEach(p  => p.classList.toggle('active', p.id === tabId));
    // 切到历史标签时初始化图表（只初始化一次）
    if (tabId === 'ee-history'    && !window._eeChartInit)    { initEEHistory();    window._eeChartInit = true; }
    if (tabId === 'bcpnp-history' && !window._bcChartInit)    { initBCHistory();    window._bcChartInit = true; }
    if (tabId === 'oinp-history'  && !window._oinpChartInit)  { initOINPHistory();  window._oinpChartInit = true; }
    // 保存当前 tab 到 hash
    history.replaceState(null, '', '#' + tabId);
  }

  buttons.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));

  // 从 URL hash 还原 tab
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);
})();

// ----------------------------------------------------------
// 工具：安全读取输入值
// ----------------------------------------------------------
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function getInt(id) {
  return parseInt(getVal(id)) || 0;
}

function getFloat(id) {
  return parseFloat(getVal(id)) || 0;
}

function isChecked(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

// ----------------------------------------------------------
// EE 计算器 — 语言输入切换
// ----------------------------------------------------------
function initLangTypeSwitcher(typeId, prefix) {
  const typeEl = document.getElementById(typeId);
  if (!typeEl) return;

  function update() {
    const val = typeEl.value;
    ['clb', 'ielts', 'celpip'].forEach(t => {
      const el = document.getElementById(`${prefix}-${t}-inputs`);
      if (el) el.classList.toggle('hidden', t !== val);
    });
  }

  typeEl.addEventListener('change', update);
  update();
}

// IELTS 实时转换 CLB 预览
function initIELTSPreview(prefix) {
  const skills = ['l', 'r', 'w', 's'];
  const skillNames = ['listening', 'reading', 'writing', 'speaking'];

  skills.forEach((s, i) => {
    const inputEl  = document.getElementById(`${prefix}-ielts-${s}`);
    const previewEl = document.getElementById(`${prefix}-ielts-${s}-clb`);
    if (!inputEl || !previewEl) return;

    inputEl.addEventListener('input', () => {
      const clb = ieltsToCLB(skillNames[i], inputEl.value);
      previewEl.textContent = clb >= 4 ? `CLB ${clb}` : '';
    });
  });
}

// 读取某前缀的4项 CLB
function readLangCLBs(prefix, langType) {
  const skills = ['l', 'r', 'w', 's'];
  const skillNames = ['listening', 'reading', 'writing', 'speaking'];
  const result = {};

  if (langType === 'clb') {
    skills.forEach((s, i) => {
      result[skillNames[i]] = getInt(`${prefix}-clb-${s}`);
    });
  } else if (langType === 'ielts') {
    const skillMap = ['listening', 'reading', 'writing', 'speaking'];
    skills.forEach((s, i) => {
      result[skillNames[i]] = ieltsToCLB(skillMap[i], getFloat(`${prefix}-ielts-${s}`));
    });
  } else if (langType === 'celpip') {
    skills.forEach((s, i) => {
      result[skillNames[i]] = celpipToCLB(getInt(`${prefix}-celpip-${s}`));
    });
  }

  return result;
}

// ----------------------------------------------------------
// EE 计算器
// ----------------------------------------------------------
function initEECalculator() {
  // 语言切换
  initLangTypeSwitcher('lang1-type', 'lang1');
  initLangTypeSwitcher('lang2-type', 'lang2');
  initIELTSPreview('l1');
  initIELTSPreview('l2');

  // 婚姻状态切换 → 显/隐配偶区域
  document.querySelectorAll('input[name="marital"]').forEach(el => {
    el.addEventListener('change', () => {
      const isMarried = el.value === 'married' && el.checked;
      document.getElementById('spouse-section').style.display = isMarried ? 'block' : 'none';
      recalcEE();
    });
  });

  // 第二语言切换
  document.getElementById('has-lang2').addEventListener('change', (e) => {
    document.getElementById('lang2-section').classList.toggle('hidden', !e.target.checked);
    recalcEE();
  });

  // 监听所有 EE 表单变化
  const eeSection = document.getElementById('ee-calc');
  eeSection.addEventListener('input', recalcEE);
  eeSection.addEventListener('change', recalcEE);
}

function getEEFormData() {
  const hasSpouse  = document.querySelector('input[name="marital"]:checked')?.value === 'married';
  const lang1Type  = getVal('lang1-type');
  const lang2Type  = getVal('lang2-type');
  const hasLang2   = isChecked('has-lang2');

  const firstLangCLBs  = readLangCLBs('l1', lang1Type);
  const secondLangCLBs = hasLang2 ? readLangCLBs('l2', lang2Type) : null;

  const data = {
    maritalStatus: hasSpouse ? 'married' : 'single',
    age:           getInt('ee-age'),
    education:     getVal('ee-edu'),
    firstLangCLBs,
    secondLangCLBs,
    canadianWork:  getInt('ee-can-work'),
    foreignWork:   getInt('ee-foreign-work'),
    hasCertificate: isChecked('ee-cert'),

    // Additional
    provincialNomination: isChecked('ee-pnp'),
    canadianEducation: getVal('ee-can-edu') === 'none' ? null : getVal('ee-can-edu'),
    frenchSkills:   getVal('ee-french') === 'none' ? null : getVal('ee-french'),
    siblingInCanada: isChecked('ee-sibling')
  };

  if (hasSpouse) {
    const spLangType = 'clb'; // 配偶固定用CLB输入
    data.spouse = {
      education:    getVal('sp-edu'),
      langCLBs: {
        listening: getInt('sp-clb-l'),
        reading:   getInt('sp-clb-r'),
        writing:   getInt('sp-clb-w'),
        speaking:  getInt('sp-clb-s')
      },
      canadianWork: getInt('sp-can-work')
    };
  }

  return data;
}

function recalcEE() {
  const data   = getEEFormData();
  const result = calculateCRS(data);
  renderEEResult(result, data);
}

function renderEEResult(result, data) {
  const total = result.total;

  // 总分
  const scoreEl = document.getElementById('ee-total-score');
  const cardEl  = document.getElementById('ee-score-card');
  const badgeEl = document.getElementById('ee-score-badge');

  scoreEl.textContent = total;

  // 分数段着色
  cardEl.className = 'score-card';
  let advice = '';
  if (total >= 500) {
    cardEl.classList.add('score-high');
    badgeEl.textContent = '竞争力很强 ✓';
    advice = `您的 CRS 分数为 ${total}，属于较高水平，EE 全类别或 CEC 专项邀请均有很大概率被邀请。建议保持 profile 最新状态，定期关注开抽动态。`;
  } else if (total >= 450) {
    cardEl.classList.add('score-medium');
    badgeEl.textContent = '分数较好 ~';
    advice = `您的 CRS 分数为 ${total}，在竞争激烈的 EE 池中属于中等偏上。可重点关注 CEC 专项开抽，或考虑通过省提名（PNP）额外获得 600 分。`;
  } else if (total >= 350) {
    cardEl.classList.add('score-low');
    badgeEl.textContent = '需提升分数';
    advice = `您的 CRS 分数为 ${total}，目前被全类别或 CEC 邀请的概率较低。建议提升语言成绩、积累加拿大工作经验，或积极申请省提名计划（PNP）。`;
  } else {
    cardEl.className = 'score-card score-default';
    badgeEl.textContent = '填写完整信息';
    advice = total > 0 ? `当前分数为 ${total}，请确保已填写所有信息以获得准确评估。` : '请填写左侧表单以计算您的 CRS 分数。';
  }

  // 分项详情
  const sA = result.sectionA;
  const sB = result.sectionB;
  const sC = result.sectionC;
  const sD = result.sectionD;

  setText('bk-age',      sA.age);
  setText('bk-edu',      sA.education);
  setText('bk-lang1',    sA.firstLang);
  setText('bk-lang2',    sA.secondLang);
  setText('bk-can-work', sA.canadianWork);
  setText('bk-a-total',  `${sA.total} / ${sA.max}`);

  setText('bk-b-total',  `${sB.total} / 40`);
  setText('bk-sp-edu',   sB.education);
  setText('bk-sp-lang',  sB.language);
  setText('bk-sp-work',  sB.work);

  setText('bk-c-total',  `${sC.total} / 100`);
  setText('bk-c1', sC.c1);
  setText('bk-c2', sC.c2);
  setText('bk-c3', sC.c3);
  setText('bk-c4', sC.c4);
  setText('bk-c5', sC.c5);

  setText('bk-d-total',  `${sD.total} / 600`);
  setText('bk-pnp',     sD.provincialNomination || 0);
  setText('bk-job',     0);
  setText('bk-can-edu', sD.canadianEducation || 0);
  setText('bk-french',  sD.frenchSkills || 0);
  setText('bk-sibling', sD.siblingInCanada || 0);

  // 建议文字
  document.getElementById('ee-advice-text').textContent = advice;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ----------------------------------------------------------
// BCPNP 计算器
// ----------------------------------------------------------
function initBCPNPCalculator() {
  const bcSection = document.getElementById('bcpnp-calc');
  bcSection.addEventListener('input',  recalcBCPNP);
  bcSection.addEventListener('change', recalcBCPNP);
}

function getBCFormData() {
  return {
    hasJobOffer: isChecked('bc-has-offer'),
    hourlyWage: getFloat('bc-wage'),
    directWorkExp: getVal('bc-direct-work-exp'),
    hasCanadaWorkExp: isChecked('bc-work-canada'),
    isCurrentBCJob: isChecked('bc-work-current'),
    educationLevel: getVal('bc-edu-level'),
    educationLocation: getVal('bc-edu-location'),
    hasProfessionalDesignation: isChecked('bc-edu-designation'),
    langCLB: getInt('bc-lang-clb'),
    hasDualLanguage: isChecked('bc-lang-dual'),
    area: getVal('bc-area'),
    hasRegionalBonus: isChecked('bc-area-bonus')
  };
}

function recalcBCPNP() {
  const data   = getBCFormData();
  const result = calculateBCPNP(data);
  renderBCResult(result, data);
}

function renderBCResult(result, data) {
  const total = result.total;

  document.getElementById('bc-total-score').textContent = total;
  const cardEl  = document.querySelector('#bcpnp-calc .score-card');
  const badgeEl = document.getElementById('bc-score-badge');

  cardEl.className = 'score-card';
  let advice = '';
  if (!data.hasJobOffer) {
    cardEl.className = 'score-card score-default';
    badgeEl.textContent = '缺少工作 Offer';
    advice = 'BCPNP Skills Immigration 通常要求有效工作 Offer。';
  } else if (total >= 120) {
    cardEl.classList.add('score-high');
    badgeEl.textContent = '竞争力强 ✓';
    advice = `您的 BCPNP 注册分数为 ${total}，处于较强区间。建议结合最新邀请记录评估递交时机。`;
  } else if (total >= 90) {
    cardEl.classList.add('score-medium');
    badgeEl.textContent = '分数中等 ~';
    advice = `您的 BCPNP 注册分数为 ${total}，接近常见邀请区间。可通过工资、语言、教育和地区因素进一步提升。`;
  } else {
    cardEl.classList.add('score-low');
    badgeEl.textContent = '分数偏低';
    advice = `您的 BCPNP 注册分数为 ${total}，当前竞争力偏低。建议优先提升工资、语言和地区分项。`;
  }

  const bk = result.breakdown;
  document.getElementById('bc-bk-human').textContent  = `${bk.humanCapital.score} / 120`;
  document.getElementById('bc-bk-economic').textContent = `${bk.economic.score} / 80`;
  document.getElementById('bc-bk-wage').textContent   = `${bk.wage.score} / 55`;
  document.getElementById('bc-bk-area').textContent   = `${bk.area.score} / 25`;
  document.getElementById('bc-bk-work').textContent   = `${bk.workExp.score} / 40`;
  document.getElementById('bc-bk-work-detail').textContent = `基础${bk.workExp.base} + 加拿大${bk.workExp.canada} + 当前BC${bk.workExp.current}`;
  document.getElementById('bc-bk-edu').textContent    = `${bk.education.score} / 40`;
  document.getElementById('bc-bk-edu-detail').textContent = `基础${bk.education.base} + 学历地点${bk.education.location} + 职业资格${bk.education.designation}`;
  document.getElementById('bc-bk-lang').textContent   = `${bk.language.score} / 40`;
  document.getElementById('bc-bk-lang-detail').textContent = `基础${bk.language.base} + 双语${bk.language.dual}`;

  document.getElementById('bc-advice-text').textContent = advice;
}

// ----------------------------------------------------------
// OINP 评估器
// ----------------------------------------------------------
function initOINPEvaluator() {
  const oinpSection = document.getElementById('oinp-calc');
  oinpSection.addEventListener('input',  recalcOINP);
  oinpSection.addEventListener('change', recalcOINP);
}

function getOINPFormData() {
  return {
    stream: getVal('oinp-stream'),
    nocTeer: getVal('oinp-noc-teer'),
    nocBroad: getVal('oinp-noc-broad'),
    hourlyWage: getFloat('oinp-wage'),
    hasValidPermit: isChecked('oinp-valid-permit'),
    jobTenure6m: isChecked('oinp-tenure-6m'),
    earnings40k: isChecked('oinp-earnings-40k'),
    education: getVal('oinp-edu'),
    field: getVal('oinp-field'),
    canadianCredential: getVal('oinp-can-cred'),
    langCLB: getInt('oinp-lang-clb'),
    langKnowledge: getVal('oinp-lang-knowledge'),
    jobRegion: getVal('oinp-job-region'),
    studyRegion: getVal('oinp-study-region')
  };
}

function recalcOINP() {
  const data = getOINPFormData();
  const result = calculateOINPEOI(data);
  renderOINPResult(result);
}

function renderOINPResult(result) {
  const container = document.getElementById('oinp-streams-result');
  if (!container) return;
  const labels = {
    job_teer: 'NOC TEER',
    job_broad: 'NOC Broad Category',
    job_wage: '工资',
    permit: '工签状态',
    tenure: '在该职位时长',
    earnings: '收入记录',
    education_level: '教育水平',
    field: '专业领域',
    canadian_credential: '加拿大教育经历',
    lang_ability: '语言能力',
    lang_knowledge: '官方语言组合',
    job_region: '工作地区',
    study_region: '学习地区'
  };
  const detailRows = Object.entries(result.detail).map(([k, v]) => `
    <div class="breakdown-item"><span>${labels[k] || k}</span><span>${v}</span></div>
  `).join('');

  container.innerHTML = `
    <div class="oinp-stream-item eligible">
      <div class="stream-header">
        <span class="stream-badge">🧮</span>
        <span class="stream-name">EOI 总分：${result.total}</span>
      </div>
      <div class="breakdown-items">${detailRows}</div>
    </div>
  `;
}

// ----------------------------------------------------------
// 历史图表 & 表格
// ----------------------------------------------------------

function getTypeBadgeClass(type) {
  const t = type.toLowerCase();
  if (t.includes('cec'))     return 'cec';
  if (t.includes('pnp'))     return 'pnp';
  if (t.includes('全类别') || t.includes('general')) return 'general';
  if (t.includes('stem'))    return 'stem';
  if (t.includes('tech') || t.includes('技术')) return 'tech';
  if (t.includes('hcp'))     return 'hcp';
  return '';
}

function renderHistoryTable(tableId, data) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  tbody.innerHTML = data.map(row => {
    const cutoff = row.cutoff != null ? `<span class="cutoff-value">${row.cutoff}</span>` : '<span style="color:#bbb">—</span>';
    const invited = `<span class="invited-value">${row.invited.toLocaleString()}</span>`;
    const badgeCls = getTypeBadgeClass(row.type);
    return `<tr>
      <td>${row.date}</td>
      <td><span class="type-badge ${badgeCls}">${row.type}</span></td>
      <td>${cutoff}</td>
      <td>${invited}</td>
    </tr>`;
  }).join('');
}

function renderHistoryStats(containerId, data) {
  const withCutoff = data.filter(d => d.cutoff != null);
  if (withCutoff.length === 0) {
    document.getElementById(containerId).innerHTML =
      '<div class="stat-card"><div class="stat-label">暂无分数数据</div></div>';
    return;
  }

  const latest = withCutoff[0];
  const max    = Math.max(...withCutoff.map(d => d.cutoff));
  const min    = Math.min(...withCutoff.map(d => d.cutoff));
  const avg    = Math.round(withCutoff.reduce((s, d) => s + d.cutoff, 0) / withCutoff.length);

  document.getElementById(containerId).innerHTML = `
    <div class="stat-card">
      <div class="stat-label">最近一次</div>
      <div class="stat-value">${latest.cutoff}</div>
      <div class="stat-sub">${latest.date} · ${latest.type}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">近期最高分</div>
      <div class="stat-value" style="color:var(--red)">${max}</div>
      <div class="stat-sub">近12月内</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">近期最低分</div>
      <div class="stat-value" style="color:var(--green)">${min}</div>
      <div class="stat-sub">近12月内</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">近期平均分</div>
      <div class="stat-value" style="color:var(--orange)">${avg}</div>
      <div class="stat-sub">近12月内</div>
    </div>`;
}

function renderHistoryChart(canvasId, data, label, color) {
  const withCutoff = data.filter(d => d.cutoff != null);
  // 按日期升序排列（图表从左到右 = 从旧到新）
  const sorted = [...withCutoff].reverse();
  const labels = sorted.map(d => d.date.slice(5)); // MM-DD
  const values = sorted.map(d => d.cutoff);

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const minVal = Math.max(0, Math.min(...values) - 30);
  const maxVal = Math.max(...values) + 30;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: "'PingFang SC','Microsoft YaHei',sans-serif", size: 12 } }
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return sorted[idx].date + ' · ' + sorted[idx].type;
            },
            label: (item) => ` 最低邀请分：${item.raw}`,
            afterLabel: (item) => {
              const idx = item.dataIndex;
              return ` 邀请人数：${sorted[idx].invited.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'PingFang SC','Microsoft YaHei',sans-serif", size: 11 },
            maxRotation: 45
          },
          grid: { color: '#f0f0f0' }
        },
        y: {
          min: minVal,
          max: maxVal,
          ticks: {
            font: { family: "'PingFang SC','Microsoft YaHei',sans-serif", size: 11 }
          },
          grid: { color: '#f0f0f0' }
        }
      }
    }
  });
}

// ----------------------------------------------------------
// 数据来源选择：优先使用 scraper 生成的实时数据，fallback 到静态备用数据
// ----------------------------------------------------------
function getLiveData(liveVar, fallback) {
  return (typeof liveVar !== 'undefined' && Array.isArray(liveVar) && liveVar.length > 0)
    ? liveVar : fallback;
}

function showDataSourceBadge(containerId, isLive) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const updated = (typeof LIVE_DATA_UPDATED !== 'undefined') ? LIVE_DATA_UPDATED : null;
  const badge = document.createElement('div');
  badge.style.cssText = 'font-size:0.75rem;color:#999;margin-bottom:8px';
  badge.textContent = isLive
    ? `数据来源：官方网站（更新于 ${updated || '最近一次爬取'}）`
    : '数据来源：内置备用数据（运行 scraper/scraper.py 可获取最新数据）';
  el.parentElement.insertBefore(badge, el);
}

function initEEHistory() {
  const data   = getLiveData(typeof LIVE_EE_HISTORY !== 'undefined' ? LIVE_EE_HISTORY : undefined, EE_HISTORY);
  const isLive = data !== EE_HISTORY;
  showDataSourceBadge('ee-stats', isLive);
  renderHistoryStats('ee-stats', data);
  renderHistoryTable('ee-table', data);
  renderHistoryChart('ee-chart', data, 'EE 最低邀请 CRS 分数', '#D52B1E');
}

function initBCHistory() {
  const data   = getLiveData(typeof LIVE_BCPNP_HISTORY !== 'undefined' ? LIVE_BCPNP_HISTORY : undefined, BCPNP_HISTORY);
  const isLive = data !== BCPNP_HISTORY;
  showDataSourceBadge('bc-stats', isLive);
  renderHistoryStats('bc-stats', data);
  renderHistoryTable('bc-table', data);
  renderHistoryChart('bc-chart', data, 'BCPNP 最低邀请 SIRS 分数', '#1B3A6B');
}

function initOINPHistory() {
  const data     = getLiveData(typeof LIVE_OINP_HISTORY !== 'undefined' ? LIVE_OINP_HISTORY : undefined, OINP_HISTORY);
  const isLive   = data !== OINP_HISTORY;
  const withCutoff = data.filter(d => d.cutoff != null);
  showDataSourceBadge('oinp-stats', isLive);
  renderHistoryStats('oinp-stats', data);
  renderHistoryTable('oinp-table', data);
  if (withCutoff.length > 0) {
    renderHistoryChart('oinp-chart', withCutoff, 'OINP HCP 最低邀请 CRS 分数', '#27AE60');
  } else {
    const canvas = document.getElementById('oinp-chart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.font = '14px PingFang SC,Microsoft YaHei,sans-serif';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('该项目大多数流程不公开具体分数门槛', canvas.width / 2, canvas.height / 2);
    }
  }
}

// ----------------------------------------------------------
// 初始化所有模块
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initEECalculator();
  initBCPNPCalculator();
  initOINPEvaluator();

  // 如果初始 tab 是历史页面，立即初始化
  const hash = location.hash.replace('#', '') || 'ee-calc';
  if (hash === 'ee-history')    { initEEHistory();   window._eeChartInit = true; }
  if (hash === 'bcpnp-history') { initBCHistory();   window._bcChartInit = true; }
  if (hash === 'oinp-history')  { initOINPHistory(); window._oinpChartInit = true; }

  // 触发初始计算
  recalcEE();
  recalcBCPNP();
  recalcOINP();
});
