import { useEffect, useMemo, useState } from 'react';
import './react.css';
import {
  calculateBCPNP,
  calculateCRS,
  calculateOINPEOI,
  type BCFormData,
  type EEFormData,
  type OINPFormData
} from './lib/calculators';
import { BCPNP_HISTORY, EE_HISTORY, OINP_HISTORY, type HistoryRecord } from './lib/history';

type Tab = 'ee' | 'bc' | 'oinp' | 'ee_history' | 'bc_history' | 'oinp_history';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'ee', label: '联邦 EE 算分' },
  { id: 'bc', label: 'BCPNP 算分' },
  { id: 'oinp', label: 'OINP 算分' },
  { id: 'ee_history', label: 'EE 邀请历史' },
  { id: 'bc_history', label: 'BCPNP 邀请历史' },
  { id: 'oinp_history', label: 'OINP 邀请历史' }
];

const defaultEE: EEFormData = {
  maritalStatus: 'single',
  age: 30,
  education: 'bachelors',
  firstLangCLBs: { listening: 9, reading: 9, writing: 9, speaking: 9 },
  secondLangCLBs: null,
  canadianWork: 0,
  foreignWork: 2,
  hasCertificate: false,
  provincialNomination: false,
  canadianEducation: null,
  frenchSkills: null,
  siblingInCanada: false
};

const defaultBC: BCFormData = {
  hasJobOffer: true,
  hourlyWage: 36,
  directWorkExp: 'y3_to_lt4',
  hasCanadaWorkExp: false,
  isCurrentBCJob: false,
  educationLevel: 'bachelors',
  educationLocation: 'none',
  hasProfessionalDesignation: false,
  langCLB: 7,
  hasDualLanguage: false,
  area: 'area3_other_bc',
  hasRegionalBonus: false
};

const defaultOINP: OINPFormData = {
  stream: 'ejo_foreign_worker',
  nocTeer: 'teer23',
  nocBroad: 'cat023',
  hourlyWage: 30,
  hasValidPermit: true,
  jobTenure6m: false,
  earnings40k: false,
  education: 'bachelors',
  field: 'business_social_services',
  canadianCredential: 'none',
  langCLB: 7,
  langKnowledge: 'one_official',
  jobRegion: 'outside_gta_not_north',
  studyRegion: 'not_in_person'
};

function NumberInput(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        onChange={(e) => props.onChange(Number(e.target.value || 0))}
      />
    </label>
  );
}

function SelectInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function HistoryTable({ data }: { data: HistoryRecord[] }) {
  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>日期</th>
          <th>轮次</th>
          <th>最低分</th>
          <th>邀请人数</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={`${row.date}-${row.type}-${row.cutoff ?? 'null'}-${row.invited ?? 'null'}`}>
            <td>{row.date}</td>
            <td>{row.type}</td>
            <td>{row.cutoff ?? '-'}</td>
            <td>{row.invited == null ? '-' : row.invited.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type LiveHistoryPayload = {
  updated: string;
  ee: HistoryRecord[];
  bcpnp: HistoryRecord[];
  oinp: HistoryRecord[];
};

export default function App() {
  const [tab, setTab] = useState<Tab>('ee');
  const [ee, setEE] = useState<EEFormData>(defaultEE);
  const [bc, setBC] = useState<BCFormData>(defaultBC);
  const [oinp, setOINP] = useState<OINPFormData>(defaultOINP);
  const [historyUpdated, setHistoryUpdated] = useState<string | null>(null);
  const [historySource, setHistorySource] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [historyData, setHistoryData] = useState<{ ee: HistoryRecord[]; bcpnp: HistoryRecord[]; oinp: HistoryRecord[] }>({
    ee: EE_HISTORY,
    bcpnp: BCPNP_HISTORY,
    oinp: OINP_HISTORY
  });

  const eeResult = useMemo(() => calculateCRS(ee), [ee]);
  const bcResult = useMemo(() => calculateBCPNP(bc), [bc]);
  const oinpResult = useMemo(() => calculateOINPEOI(oinp), [oinp]);

  useEffect(() => {
    let canceled = false;
    const fetchLiveHistory = async () => {
      try {
        const resp = await fetch('/data/history_data.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const payload = (await resp.json()) as Partial<LiveHistoryPayload>;
        if (!Array.isArray(payload.ee) || !Array.isArray(payload.bcpnp) || !Array.isArray(payload.oinp)) {
          throw new Error('invalid payload');
        }
        if (canceled) return;
        setHistoryData({ ee: payload.ee, bcpnp: payload.bcpnp, oinp: payload.oinp });
        setHistoryUpdated(typeof payload.updated === 'string' ? payload.updated : null);
        setHistorySource('live');
      } catch {
        if (canceled) return;
        setHistorySource('fallback');
      }
    };
    void fetchLiveHistory();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>加拿大移民分数计算器</h1>
        <p className="muted">
          邀请数据来源: {historySource === 'live' ? '官网抓取' : historySource === 'fallback' ? '内置兜底' : '加载中...'}
          {historyUpdated ? ` · 更新于 ${historyUpdated}` : ''}
        </p>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'ee' && (
        <section className="panel two-col">
          <div className="card">
            <h2>EE CRS（最新规则）</h2>
            <div className="grid-2">
              <SelectInput
                label="婚姻状态"
                value={ee.maritalStatus}
                onChange={(v) => setEE({ ...ee, maritalStatus: v as EEFormData['maritalStatus'] })}
                options={[{ value: 'single', label: '单身' }, { value: 'married', label: '已婚/同居' }]}
              />
              <NumberInput label="年龄" value={ee.age} min={17} max={60} onChange={(v) => setEE({ ...ee, age: v })} />

              <SelectInput
                label="学历"
                value={ee.education}
                onChange={(v) => setEE({ ...ee, education: v })}
                options={[
                  { value: 'none', label: '无正式学历' },
                  { value: 'high_school', label: '高中' },
                  { value: 'one_year', label: '1年制证书/文凭' },
                  { value: 'two_year', label: '2年制证书/文凭' },
                  { value: 'bachelors', label: '学士' },
                  { value: 'two_or_more', label: '两个或以上证书' },
                  { value: 'masters', label: '硕士/专业学位' },
                  { value: 'phd', label: '博士' }
                ]}
              />
              <NumberInput label="加拿大工作经验(年)" value={ee.canadianWork} min={0} max={5} onChange={(v) => setEE({ ...ee, canadianWork: v })} />

              <NumberInput label="海外工作经验(0/1/2)" value={ee.foreignWork} min={0} max={2} onChange={(v) => setEE({ ...ee, foreignWork: v })} />
              <label className="checkbox"><input type="checkbox" checked={ee.hasCertificate} onChange={(e) => setEE({ ...ee, hasCertificate: e.target.checked })} />行业资质证书</label>
            </div>

            <h3>第一官方语言 CLB</h3>
            <div className="grid-4">
              {(['listening', 'reading', 'writing', 'speaking'] as const).map((k) => (
                <NumberInput
                  key={k}
                  label={k}
                  value={ee.firstLangCLBs[k]}
                  min={0}
                  max={12}
                  onChange={(v) => setEE({ ...ee, firstLangCLBs: { ...ee.firstLangCLBs, [k]: v } })}
                />
              ))}
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={!!ee.secondLangCLBs}
                onChange={(e) => setEE({ ...ee, secondLangCLBs: e.target.checked ? { listening: 0, reading: 0, writing: 0, speaking: 0 } : null })}
              />
              有第二官方语言
            </label>

            {ee.secondLangCLBs && (
              <div className="grid-4">
                {(['listening', 'reading', 'writing', 'speaking'] as const).map((k) => (
                  <NumberInput
                    key={`l2-${k}`}
                    label={`L2 ${k}`}
                    value={ee.secondLangCLBs?.[k] ?? 0}
                    min={0}
                    max={12}
                    onChange={(v) => setEE({ ...ee, secondLangCLBs: { ...(ee.secondLangCLBs || { listening: 0, reading: 0, writing: 0, speaking: 0 }), [k]: v } })}
                  />
                ))}
              </div>
            )}

            {ee.maritalStatus === 'married' && (
              <>
                <h3>配偶信息</h3>
                <SelectInput
                  label="配偶学历"
                  value={ee.spouse?.education || 'none'}
                  onChange={(v) => setEE({ ...ee, spouse: { education: v, langCLBs: ee.spouse?.langCLBs || { listening: 0, reading: 0, writing: 0, speaking: 0 }, canadianWork: ee.spouse?.canadianWork || 0 } })}
                  options={[
                    { value: 'none', label: '无正式学历' },
                    { value: 'high_school', label: '高中' },
                    { value: 'one_year', label: '1年制' },
                    { value: 'two_year', label: '2年制' },
                    { value: 'bachelors', label: '学士' },
                    { value: 'two_or_more', label: '两个及以上证书' },
                    { value: 'masters', label: '硕士' },
                    { value: 'phd', label: '博士' }
                  ]}
                />
                <div className="grid-4">
                  {(['listening', 'reading', 'writing', 'speaking'] as const).map((k) => (
                    <NumberInput
                      key={`sp-${k}`}
                      label={`配偶 ${k}`}
                      value={ee.spouse?.langCLBs?.[k] || 0}
                      min={0}
                      max={12}
                      onChange={(v) => setEE({ ...ee, spouse: { education: ee.spouse?.education || 'none', langCLBs: { ...(ee.spouse?.langCLBs || { listening: 0, reading: 0, writing: 0, speaking: 0 }), [k]: v }, canadianWork: ee.spouse?.canadianWork || 0 } })}
                    />
                  ))}
                </div>
                <NumberInput label="配偶加拿大工作经验" value={ee.spouse?.canadianWork || 0} min={0} max={5} onChange={(v) => setEE({ ...ee, spouse: { education: ee.spouse?.education || 'none', langCLBs: ee.spouse?.langCLBs || { listening: 0, reading: 0, writing: 0, speaking: 0 }, canadianWork: v } })} />
              </>
            )}

            <h3>附加分</h3>
            <div className="grid-2">
              <label className="checkbox"><input type="checkbox" checked={ee.provincialNomination} onChange={(e) => setEE({ ...ee, provincialNomination: e.target.checked })} />PNP 省提名 (+600)</label>
              <label className="checkbox"><input type="checkbox" checked={ee.siblingInCanada} onChange={(e) => setEE({ ...ee, siblingInCanada: e.target.checked })} />在加兄弟姐妹 (+15)</label>
              <SelectInput
                label="加拿大学历"
                value={ee.canadianEducation || 'none'}
                onChange={(v) => setEE({ ...ee, canadianEducation: v === 'none' ? null : (v as EEFormData['canadianEducation']) })}
                options={[{ value: 'none', label: '无' }, { value: 'one_two_year', label: '1-2年 (+15)' }, { value: 'three_plus', label: '3年及以上 (+30)' }]}
              />
              <SelectInput
                label="法语加分"
                value={ee.frenchSkills || 'none'}
                onChange={(v) => setEE({ ...ee, frenchSkills: v === 'none' ? null : (v as EEFormData['frenchSkills']) })}
                options={[{ value: 'none', label: '无' }, { value: 'clb7_no_english', label: 'CLB7+且英语<CLB5 (+25)' }, { value: 'clb7_any_english', label: 'CLB7+且英语达标 (+50)' }]}
              />
            </div>
            <p className="muted">Job Offer CRS 加分已于 2025-03-25 取消。</p>
          </div>

          <div className="card result">
            <h2>CRS 总分</h2>
            <div className="big-number">{eeResult.total}</div>
            <ul>
              <li>A 核心人力资本: {eeResult.sectionA.total} / {eeResult.sectionA.max}</li>
              <li>B 配偶因素: {eeResult.sectionB.total} / 40</li>
              <li>C 技能可转移: {eeResult.sectionC.total} / 100</li>
              <li>D 附加分: {eeResult.sectionD.total} / 600</li>
            </ul>
          </div>
        </section>
      )}

      {tab === 'bc' && (
        <section className="panel two-col">
          <div className="card">
            <h2>BCPNP Skills Immigration (200分制)</h2>
            <div className="grid-2">
              <label className="checkbox"><input type="checkbox" checked={bc.hasJobOffer} onChange={(e) => setBC({ ...bc, hasJobOffer: e.target.checked })} />有工作 Offer</label>
              <NumberInput label="时薪(CAD)" value={bc.hourlyWage} min={0} step={0.01} onChange={(v) => setBC({ ...bc, hourlyWage: v })} />
              <SelectInput label="直接相关工作经验" value={bc.directWorkExp} onChange={(v) => setBC({ ...bc, directWorkExp: v })} options={[
                { value: 'no_experience', label: '无经验' },
                { value: 'lt_1', label: '<1年' },
                { value: 'y1_to_lt2', label: '1-<2年' },
                { value: 'y2_to_lt3', label: '2-<3年' },
                { value: 'y3_to_lt4', label: '3-<4年' },
                { value: 'y4_to_lt5', label: '4-<5年' },
                { value: 'y5_plus', label: '5年以上' }
              ]} />
              <NumberInput label="语言 CLB" value={bc.langCLB} min={0} max={9} onChange={(v) => setBC({ ...bc, langCLB: v })} />
              <label className="checkbox"><input type="checkbox" checked={bc.hasCanadaWorkExp} onChange={(e) => setBC({ ...bc, hasCanadaWorkExp: e.target.checked })} />加拿大全职经验(+10)</label>
              <label className="checkbox"><input type="checkbox" checked={bc.isCurrentBCJob} onChange={(e) => setBC({ ...bc, isCurrentBCJob: e.target.checked })} />当前BC同雇主职业(+10)</label>
              <SelectInput label="教育等级" value={bc.educationLevel} onChange={(v) => setBC({ ...bc, educationLevel: v })} options={[
                { value: 'secondary_or_less', label: '高中及以下' },
                { value: 'diploma_or_certificate', label: '文凭/证书' },
                { value: 'associate_degree', label: '副学士' },
                { value: 'bachelors', label: '学士' },
                { value: 'post_graduate', label: '研究生文凭' },
                { value: 'masters', label: '硕士' },
                { value: 'doctoral', label: '博士' }
              ]} />
              <SelectInput label="学历地点" value={bc.educationLocation} onChange={(v) => setBC({ ...bc, educationLocation: v })} options={[
                { value: 'none', label: '无加分' },
                { value: 'bc', label: 'BC (+8)' },
                { value: 'canada_other', label: '加拿大其他省 (+6)' }
              ]} />
              <label className="checkbox"><input type="checkbox" checked={bc.hasProfessionalDesignation} onChange={(e) => setBC({ ...bc, hasProfessionalDesignation: e.target.checked })} />BC职业资格(+5)</label>
              <label className="checkbox"><input type="checkbox" checked={bc.hasDualLanguage} onChange={(e) => setBC({ ...bc, hasDualLanguage: e.target.checked })} />英法双语(+10)</label>
              <SelectInput label="工作地区" value={bc.area} onChange={(v) => setBC({ ...bc, area: v })} options={[
                { value: 'area1_mvrd', label: 'Area 1: Metro Vancouver' },
                { value: 'area2_selected_cities', label: 'Area 2: 指定城市' },
                { value: 'area3_other_bc', label: 'Area 3: 其他BC地区' }
              ]} />
              <label className="checkbox"><input type="checkbox" checked={bc.hasRegionalBonus} onChange={(e) => setBC({ ...bc, hasRegionalBonus: e.target.checked })} />区域经验/校友(+10)</label>
            </div>
          </div>

          <div className="card result">
            <h2>BCPNP 总分</h2>
            <div className="big-number">{bcResult.total}</div>
            <ul>
              <li>Human Capital: {bcResult.breakdown.humanCapital.score} / 120</li>
              <li>Economic: {bcResult.breakdown.economic.score} / 80</li>
              <li>工资: {bcResult.breakdown.wage.score} / 55</li>
              <li>地区: {bcResult.breakdown.area.score} / 25</li>
            </ul>
          </div>
        </section>
      )}

      {tab === 'oinp' && (
        <section className="panel two-col">
          <div className="card">
            <h2>OINP EOI（分 stream 计分）</h2>
            <div className="grid-2">
              <SelectInput label="Stream" value={oinp.stream} onChange={(v) => setOINP({ ...oinp, stream: v })} options={[
                { value: 'ejo_foreign_worker', label: 'Employer Job Offer - Foreign Worker' },
                { value: 'ejo_in_demand', label: 'Employer Job Offer - In-Demand Skills' },
                { value: 'ejo_international_student', label: 'Employer Job Offer - International Student' },
                { value: 'masters_graduate', label: 'Masters Graduate' },
                { value: 'phd_graduate', label: 'PhD Graduate' }
              ]} />
              <SelectInput label="NOC TEER" value={oinp.nocTeer} onChange={(v) => setOINP({ ...oinp, nocTeer: v })} options={[
                { value: 'teer01', label: 'TEER 0/1' },
                { value: 'teer23', label: 'TEER 2/3' },
                { value: 'teer45', label: 'TEER 4/5' }
              ]} />
              <SelectInput label="NOC Broad Category" value={oinp.nocBroad} onChange={(v) => setOINP({ ...oinp, nocBroad: v })} options={[
                { value: 'cat023', label: '0,2,3' },
                { value: 'cat7', label: '7' },
                { value: 'cat19', label: '1,9' },
                { value: 'cat48', label: '4,8' },
                { value: 'cat56', label: '5,6' }
              ]} />
              <NumberInput label="时薪(CAD)" value={oinp.hourlyWage} min={0} step={0.01} onChange={(v) => setOINP({ ...oinp, hourlyWage: v })} />
              <label className="checkbox"><input type="checkbox" checked={oinp.hasValidPermit} onChange={(e) => setOINP({ ...oinp, hasValidPermit: e.target.checked })} />有效工签(+10)</label>
              <label className="checkbox"><input type="checkbox" checked={oinp.jobTenure6m} onChange={(e) => setOINP({ ...oinp, jobTenure6m: e.target.checked })} />职位 6个月(+3)</label>
              <label className="checkbox"><input type="checkbox" checked={oinp.earnings40k} onChange={(e) => setOINP({ ...oinp, earnings40k: e.target.checked })} />年收入≥40k(+3)</label>
              <SelectInput label="教育水平" value={oinp.education} onChange={(v) => setOINP({ ...oinp, education: v })} options={[
                { value: 'less_than_college', label: '低于学院层级' },
                { value: 'trade_or_apprenticeship', label: '技工/学徒' },
                { value: 'undergrad_diploma_or_certificate', label: '本科文凭/证书' },
                { value: 'graduate_diploma_or_certificate', label: '研究生文凭/证书' },
                { value: 'bachelors', label: '学士' },
                { value: 'masters', label: '硕士' },
                { value: 'phd_or_md', label: '博士/医学博士' }
              ]} />
              <SelectInput label="专业领域" value={oinp.field} onChange={(v) => setOINP({ ...oinp, field: v })} options={[
                { value: 'stem_health_trades', label: 'STEM/Health/Trades' },
                { value: 'business_social_services', label: 'Business/Social/Education' },
                { value: 'arts_humanities_bhase', label: 'Arts/Humanities/BHASE' }
              ]} />
              <SelectInput label="加拿大教育经历" value={oinp.canadianCredential} onChange={(v) => setOINP({ ...oinp, canadianCredential: v })} options={[
                { value: 'none', label: '无' },
                { value: 'one', label: '1个加拿大学历' },
                { value: 'more_than_one', label: '2个及以上加拿大学历' }
              ]} />
              <NumberInput label="语言 CLB" value={oinp.langCLB} min={0} max={9} onChange={(v) => setOINP({ ...oinp, langCLB: v })} />
              <SelectInput label="官方语言组合" value={oinp.langKnowledge} onChange={(v) => setOINP({ ...oinp, langKnowledge: v })} options={[
                { value: 'one_official', label: '一门官方语言' },
                { value: 'two_officials', label: '两门官方语言' }
              ]} />
              <SelectInput label="工作地区" value={oinp.jobRegion} onChange={(v) => setOINP({ ...oinp, jobRegion: v })} options={[
                { value: 'toronto', label: 'Toronto' },
                { value: 'gta_not_toronto', label: 'GTA(不含Toronto)' },
                { value: 'outside_gta_not_north', label: 'GTA外(非北安省)' },
                { value: 'northern_ontario', label: 'Northern Ontario' }
              ]} />
              <SelectInput label="学习地区" value={oinp.studyRegion} onChange={(v) => setOINP({ ...oinp, studyRegion: v })} options={[
                { value: 'not_in_person', label: '非in-person' },
                { value: 'toronto', label: 'Toronto' },
                { value: 'gta_not_toronto', label: 'GTA(不含Toronto)' },
                { value: 'outside_gta_not_north', label: 'GTA外(非北安省)' },
                { value: 'northern_ontario', label: 'Northern Ontario' }
              ]} />
            </div>
          </div>

          <div className="card result">
            <h2>OINP EOI 总分</h2>
            <div className="big-number">{oinpResult.total}</div>
            <ul>
              {Object.entries(oinpResult.detail).map(([k, v]) => (
                <li key={k}>{k}: {v}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tab === 'ee_history' && <section className="panel"><div className="card"><h2>EE 邀请历史</h2><HistoryTable data={historyData.ee} /></div></section>}
      {tab === 'bc_history' && <section className="panel"><div className="card"><h2>BCPNP 邀请历史</h2><HistoryTable data={historyData.bcpnp} /></div></section>}
      {tab === 'oinp_history' && <section className="panel"><div className="card"><h2>OINP 邀请历史</h2><HistoryTable data={historyData.oinp} /></div></section>}
    </div>
  );
}
