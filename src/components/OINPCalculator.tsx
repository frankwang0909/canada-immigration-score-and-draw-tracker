'use client';

import { useMemo, useState } from 'react';
import { calculateOINPEOI, type OINPFormData } from '@/lib/calculators';
import NumberInput from './NumberInput';
import SelectInput from './SelectInput';

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

export default function OINPCalculator() {
  const [oinp, setOINP] = useState<OINPFormData>(defaultOINP);
  const [submittedOINP, setSubmittedOINP] = useState<OINPFormData>(defaultOINP);

  const oinpResult = useMemo(() => calculateOINPEOI(submittedOINP), [submittedOINP]);

  return (
    <section className="panel two-col">
      <div className="card">
        <h2>OINP EOI（分 stream 计分）</h2>
        <div className="grid-2">
          <SelectInput
            label="Stream"
            value={oinp.stream}
            onChange={(v) => setOINP({ ...oinp, stream: v })}
            options={[
              { value: 'ejo_foreign_worker', label: 'Employer Job Offer - Foreign Worker' },
              { value: 'ejo_in_demand', label: 'Employer Job Offer - In-Demand Skills' },
              {
                value: 'ejo_international_student',
                label: 'Employer Job Offer - International Student'
              },
              { value: 'masters_graduate', label: 'Masters Graduate' },
              { value: 'phd_graduate', label: 'PhD Graduate' }
            ]}
          />
          <SelectInput
            label="NOC TEER"
            value={oinp.nocTeer}
            onChange={(v) => setOINP({ ...oinp, nocTeer: v })}
            options={[
              { value: 'teer01', label: 'TEER 0/1' },
              { value: 'teer23', label: 'TEER 2/3' },
              { value: 'teer45', label: 'TEER 4/5' }
            ]}
          />
          <SelectInput
            label="NOC Broad Category"
            value={oinp.nocBroad}
            onChange={(v) => setOINP({ ...oinp, nocBroad: v })}
            options={[
              { value: 'cat023', label: '0,2,3' },
              { value: 'cat7', label: '7' },
              { value: 'cat19', label: '1,9' },
              { value: 'cat48', label: '4,8' },
              { value: 'cat56', label: '5,6' }
            ]}
          />
          <NumberInput
            label="时薪(CAD)"
            value={oinp.hourlyWage}
            min={0}
            step={0.01}
            onChange={(v) => setOINP({ ...oinp, hourlyWage: v })}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={oinp.hasValidPermit}
              onChange={(e) => setOINP({ ...oinp, hasValidPermit: e.target.checked })}
            />
            有效工签(+10)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={oinp.jobTenure6m}
              onChange={(e) => setOINP({ ...oinp, jobTenure6m: e.target.checked })}
            />
            职位 6个月(+3)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={oinp.earnings40k}
              onChange={(e) => setOINP({ ...oinp, earnings40k: e.target.checked })}
            />
            年收入≥40k(+3)
          </label>
          <SelectInput
            label="教育水平"
            value={oinp.education}
            onChange={(v) => setOINP({ ...oinp, education: v })}
            options={[
              { value: 'less_than_college', label: '低于学院层级' },
              { value: 'trade_or_apprenticeship', label: '技工/学徒' },
              { value: 'undergrad_diploma_or_certificate', label: '本科文凭/证书' },
              { value: 'graduate_diploma_or_certificate', label: '研究生文凭/证书' },
              { value: 'bachelors', label: '学士' },
              { value: 'masters', label: '硕士' },
              { value: 'phd_or_md', label: '博士/医学博士' }
            ]}
          />
          <SelectInput
            label="专业领域"
            value={oinp.field}
            onChange={(v) => setOINP({ ...oinp, field: v })}
            options={[
              { value: 'stem_health_trades', label: 'STEM/Health/Trades' },
              { value: 'business_social_services', label: 'Business/Social/Education' },
              { value: 'arts_humanities_bhase', label: 'Arts/Humanities/BHASE' }
            ]}
          />
          <SelectInput
            label="加拿大教育经历"
            value={oinp.canadianCredential}
            onChange={(v) => setOINP({ ...oinp, canadianCredential: v })}
            options={[
              { value: 'none', label: '无' },
              { value: 'one', label: '1个加拿大学历' },
              { value: 'more_than_one', label: '2个及以上加拿大学历' }
            ]}
          />
          <NumberInput
            label="语言 CLB"
            value={oinp.langCLB}
            min={0}
            max={9}
            onChange={(v) => setOINP({ ...oinp, langCLB: v })}
          />
          <SelectInput
            label="官方语言组合"
            value={oinp.langKnowledge}
            onChange={(v) => setOINP({ ...oinp, langKnowledge: v })}
            options={[
              { value: 'one_official', label: '一门官方语言' },
              { value: 'two_officials', label: '两门官方语言' }
            ]}
          />
          <SelectInput
            label="工作地区"
            value={oinp.jobRegion}
            onChange={(v) => setOINP({ ...oinp, jobRegion: v })}
            options={[
              { value: 'toronto', label: 'Toronto' },
              { value: 'gta_not_toronto', label: 'GTA(不含Toronto)' },
              { value: 'outside_gta_not_north', label: 'GTA外(非北安省)' },
              { value: 'northern_ontario', label: 'Northern Ontario' }
            ]}
          />
          <SelectInput
            label="学习地区"
            value={oinp.studyRegion}
            onChange={(v) => setOINP({ ...oinp, studyRegion: v })}
            options={[
              { value: 'not_in_person', label: '非in-person' },
              { value: 'toronto', label: 'Toronto' },
              { value: 'gta_not_toronto', label: 'GTA(不含Toronto)' },
              { value: 'outside_gta_not_north', label: 'GTA外(非北安省)' },
              { value: 'northern_ontario', label: 'Northern Ontario' }
            ]}
          />
        </div>
        <button className="calc-btn" onClick={() => setSubmittedOINP(oinp)}>
          计算
        </button>
      </div>

      <div className="card result">
        <h2>您的 OINP EOI 得分结果</h2>
        <p className="muted">按所选 Stream 计算，仅展示该 Stream 适用的评分项。</p>

        {(['job_teer', 'job_broad', 'job_wage', 'permit', 'tenure', 'earnings'] as const).some(
          (k) => k in oinpResult.detail
        ) && (
          <div className="crs-section">
            <div className="crs-section-title">就业 / 劳动力市场因素</div>
            {'job_teer' in oinpResult.detail && (
              <div className="crs-row">
                <span>职位 NOC TEER 类别</span>
                <span>{oinpResult.detail.job_teer}</span>
              </div>
            )}
            {'job_broad' in oinpResult.detail && (
              <div className="crs-row">
                <span>职业大类（Broad Category）</span>
                <span>{oinpResult.detail.job_broad}</span>
              </div>
            )}
            {'job_wage' in oinpResult.detail && (
              <div className="crs-row">
                <span>时薪</span>
                <span>{oinpResult.detail.job_wage}</span>
              </div>
            )}
            {'permit' in oinpResult.detail && (
              <div className="crs-row">
                <span>有效工签/学签</span>
                <span>{oinpResult.detail.permit}</span>
              </div>
            )}
            {'tenure' in oinpResult.detail && (
              <div className="crs-row">
                <span>在职时长满 6 个月</span>
                <span>{oinpResult.detail.tenure}</span>
              </div>
            )}
            {'earnings' in oinpResult.detail && (
              <div className="crs-row">
                <span>加拿大税务收入 ≥ $40k</span>
                <span>{oinpResult.detail.earnings}</span>
              </div>
            )}
          </div>
        )}

        {(['education_level', 'field', 'canadian_credential'] as const).some(
          (k) => k in oinpResult.detail
        ) && (
          <div className="crs-section">
            <div className="crs-section-title">教育</div>
            {'education_level' in oinpResult.detail && (
              <div className="crs-row">
                <span>最高学历</span>
                <span>{oinpResult.detail.education_level}</span>
              </div>
            )}
            {'field' in oinpResult.detail && (
              <div className="crs-row">
                <span>专业领域</span>
                <span>{oinpResult.detail.field}</span>
              </div>
            )}
            {'canadian_credential' in oinpResult.detail && (
              <div className="crs-row">
                <span>加拿大教育经历</span>
                <span>{oinpResult.detail.canadian_credential}</span>
              </div>
            )}
          </div>
        )}

        {(['lang_ability', 'lang_knowledge'] as const).some((k) => k in oinpResult.detail) && (
          <div className="crs-section">
            <div className="crs-section-title">语言</div>
            {'lang_ability' in oinpResult.detail && (
              <div className="crs-row">
                <span>官方语言能力（CLB）</span>
                <span>{oinpResult.detail.lang_ability}</span>
              </div>
            )}
            {'lang_knowledge' in oinpResult.detail && (
              <div className="crs-row">
                <span>官方语言种类</span>
                <span>{oinpResult.detail.lang_knowledge}</span>
              </div>
            )}
          </div>
        )}

        {(['job_region', 'study_region'] as const).some((k) => k in oinpResult.detail) && (
          <div className="crs-section">
            <div className="crs-section-title">地区化</div>
            {'job_region' in oinpResult.detail && (
              <div className="crs-row">
                <span>工作地区</span>
                <span>{oinpResult.detail.job_region}</span>
              </div>
            )}
            {'study_region' in oinpResult.detail && (
              <div className="crs-row">
                <span>学习地区</span>
                <span>{oinpResult.detail.study_region}</span>
              </div>
            )}
          </div>
        )}

        <div className="crs-total-row">
          <span>OINP EOI 总分</span>
          <span>{oinpResult.total}</span>
        </div>
      </div>
    </section>
  );
}
