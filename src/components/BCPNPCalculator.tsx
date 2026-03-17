'use client';

import { useMemo, useState } from 'react';
import { calculateBCPNP, type BCFormData } from '@/lib/calculators';
import NumberInput from './NumberInput';
import SelectInput from './SelectInput';

const defaultBC: BCFormData = {
  hasJobOffer: true,
  hourlyWage: 36,
  directWorkExp: 'y2_to_lt3',
  hasCanadaWorkExp: true,
  isCurrentBCJob: false,
  educationLevel: 'bachelors',
  educationLocation: 'none',
  hasProfessionalDesignation: false,
  langCLB: 9,
  hasDualLanguage: false,
  area: 'area1_mvrd',
  hasRegionalBonus: false
};

export default function BCPNPCalculator() {
  const [bc, setBC] = useState<BCFormData>(defaultBC);
  const [submittedBC, setSubmittedBC] = useState<BCFormData>(defaultBC);

  const bcResult = useMemo(() => calculateBCPNP(submittedBC), [submittedBC]);

  return (
    <section className="panel two-col">
      <div className="card">
        <h2>BCPNP Skills Immigration (200分制)</h2>
        <div className="grid-2">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.hasJobOffer}
              onChange={(e) => setBC({ ...bc, hasJobOffer: e.target.checked })}
            />
            有工作 Offer
          </label>
          <NumberInput
            label="时薪(CAD)"
            value={bc.hourlyWage}
            min={0}
            step={0.01}
            onChange={(v) => setBC({ ...bc, hourlyWage: v })}
          />
          <SelectInput
            label="直接相关工作经验"
            value={bc.directWorkExp}
            onChange={(v) => setBC({ ...bc, directWorkExp: v })}
            options={[
              { value: 'no_experience', label: '无经验' },
              { value: 'lt_1', label: '<1年' },
              { value: 'y1_to_lt2', label: '1-<2年' },
              { value: 'y2_to_lt3', label: '2-<3年' },
              { value: 'y3_to_lt4', label: '3-<4年' },
              { value: 'y4_to_lt5', label: '4-<5年' },
              { value: 'y5_plus', label: '5年以上' }
            ]}
          />
          <NumberInput
            label="语言 CLB"
            value={bc.langCLB}
            min={0}
            max={9}
            onChange={(v) => setBC({ ...bc, langCLB: v })}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.hasCanadaWorkExp}
              onChange={(e) => setBC({ ...bc, hasCanadaWorkExp: e.target.checked })}
            />
            加拿大全职经验(+10)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.isCurrentBCJob}
              onChange={(e) => setBC({ ...bc, isCurrentBCJob: e.target.checked })}
            />
            当前BC同雇主职业(+10)
          </label>
          <SelectInput
            label="教育等级"
            value={bc.educationLevel}
            onChange={(v) => setBC({ ...bc, educationLevel: v })}
            options={[
              { value: 'secondary_or_less', label: '高中及以下' },
              { value: 'diploma_or_certificate', label: '文凭/证书' },
              { value: 'associate_degree', label: '副学士' },
              { value: 'bachelors', label: '学士' },
              { value: 'post_graduate', label: '研究生文凭' },
              { value: 'masters', label: '硕士' },
              { value: 'doctoral', label: '博士' }
            ]}
          />
          <SelectInput
            label="学历地点"
            value={bc.educationLocation}
            onChange={(v) => setBC({ ...bc, educationLocation: v })}
            options={[
              { value: 'none', label: '无加分' },
              { value: 'bc', label: 'BC (+8)' },
              { value: 'canada_other', label: '加拿大其他省 (+6)' }
            ]}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.hasProfessionalDesignation}
              onChange={(e) => setBC({ ...bc, hasProfessionalDesignation: e.target.checked })}
            />
            BC职业资格(+5)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.hasDualLanguage}
              onChange={(e) => setBC({ ...bc, hasDualLanguage: e.target.checked })}
            />
            英法双语(+10)
          </label>
          <SelectInput
            label="工作地区"
            value={bc.area}
            onChange={(v) => setBC({ ...bc, area: v })}
            options={[
              { value: 'area1_mvrd', label: 'Area 1: Metro Vancouver' },
              {
                value: 'area2_selected_cities',
                label: 'Area 2: Squamish / Abbotsford / Agassiz / Mission / Chilliwack'
              },
              { value: 'area3_other_bc', label: 'Area 3: 其他BC地区' }
            ]}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bc.hasRegionalBonus}
              onChange={(e) => setBC({ ...bc, hasRegionalBonus: e.target.checked })}
            />
            区域经验/校友(+10)
          </label>
        </div>
        <button className="calc-btn" onClick={() => setSubmittedBC(bc)}>
          计算
        </button>
      </div>

      <div className="card result">
        <h2>您的 BCPNP 得分结果</h2>
        <p className="muted">Skills Immigration 注册评分，满分 200 分。</p>

        <div className="crs-section">
          <div className="crs-section-title">人力资本因素（最高 120 分）</div>
          <div className="crs-row">
            <span>直接相关工作经验（基础）</span>
            <span>{bcResult.breakdown.workExp.base}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>加拿大直接相关经验满1年</span>
            <span>{bcResult.breakdown.workExp.canada}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>当前在BC同雇主同职位全职工作</span>
            <span>{bcResult.breakdown.workExp.current}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>工作经验小计</span>
            <span>{bcResult.breakdown.workExp.score} / 40</span>
          </div>
          <div className="crs-row">
            <span>最高学历（基础）</span>
            <span>{bcResult.breakdown.education.base}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>BC/加拿大学历加分</span>
            <span>{bcResult.breakdown.education.location}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>BC 职业资格加分</span>
            <span>{bcResult.breakdown.education.designation}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>教育小计</span>
            <span>{bcResult.breakdown.education.score} / 40</span>
          </div>
          <div className="crs-row">
            <span>语言能力（基础）</span>
            <span>{bcResult.breakdown.language.base}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>英法双语加分</span>
            <span>{bcResult.breakdown.language.dual}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>语言小计</span>
            <span>{bcResult.breakdown.language.score} / 40</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 人力资本因素</span>
            <span>{bcResult.breakdown.humanCapital.score} / 120</span>
          </div>
        </div>

        <div className="crs-section">
          <div className="crs-section-title">经济因素（最高 80 分）</div>
          <div className="crs-row">
            <span>BC职位时薪</span>
            <span>{bcResult.breakdown.wage.score} / 55</span>
          </div>
          <div className="crs-row">
            <span>工作地区（基础）</span>
            <span>{bcResult.breakdown.area.score - (bc.hasRegionalBonus ? 10 : 0)}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>区域经验/校友加分</span>
            <span>{bc.hasRegionalBonus ? 10 : 0}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 经济因素</span>
            <span>{bcResult.breakdown.economic.score} / 80</span>
          </div>
        </div>

        <div className="crs-total-row">
          <span>BCPNP 注册总分</span>
          <span>{bcResult.total}</span>
        </div>
      </div>
    </section>
  );
}
