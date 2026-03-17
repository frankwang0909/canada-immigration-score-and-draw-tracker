'use client';

import { useMemo, useState } from 'react';
import { calculateCRS, type EEFormData } from '@/lib/calculators';
import NumberInput from './NumberInput';
import SelectInput from './SelectInput';

const defaultEE: EEFormData = {
  maritalStatus: 'single',
  age: 29,
  education: 'masters',
  firstLangCLBs: { listening: 9, reading: 9, writing: 9, speaking: 9 },
  secondLangCLBs: null,
  canadianWork: 3,
  foreignWork: 0,
  hasCertificate: false,
  provincialNomination: false,
  canadianEducation: 'three_plus',
  frenchSkills: null,
  siblingInCanada: false
};

export default function EECalculator() {
  const [ee, setEE] = useState<EEFormData>(defaultEE);
  const [submittedEE, setSubmittedEE] = useState<EEFormData>(defaultEE);

  const eeResult = useMemo(() => calculateCRS(submittedEE), [submittedEE]);

  return (
    <section className="panel two-col">
      <div className="card">
        <h2>EE CRS（2026年3月最新规则）</h2>
        <div className="grid-2">
          <SelectInput
            label="婚姻状态"
            value={ee.maritalStatus}
            onChange={(v) => setEE({ ...ee, maritalStatus: v as EEFormData['maritalStatus'] })}
            options={[
              { value: 'single', label: '单身' },
              { value: 'married', label: '已婚/同居' }
            ]}
          />
          <NumberInput
            label="年龄"
            value={ee.age}
            min={17}
            max={60}
            onChange={(v) => setEE({ ...ee, age: v })}
          />

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
          <NumberInput
            label="加拿大工作经验(年)"
            value={ee.canadianWork}
            min={0}
            max={5}
            onChange={(v) => setEE({ ...ee, canadianWork: v })}
          />

          <NumberInput
            label="海外工作经验(0/1/2)"
            value={ee.foreignWork}
            min={0}
            max={2}
            onChange={(v) => setEE({ ...ee, foreignWork: v })}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={ee.hasCertificate}
              onChange={(e) => setEE({ ...ee, hasCertificate: e.target.checked })}
            />
            行业资质证书
          </label>
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
            onChange={(e) =>
              setEE({
                ...ee,
                secondLangCLBs: e.target.checked
                  ? { listening: 0, reading: 0, writing: 0, speaking: 0 }
                  : null
              })
            }
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
                onChange={(v) =>
                  setEE({
                    ...ee,
                    secondLangCLBs: {
                      ...(ee.secondLangCLBs || {
                        listening: 0,
                        reading: 0,
                        writing: 0,
                        speaking: 0
                      }),
                      [k]: v
                    }
                  })
                }
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
              onChange={(v) =>
                setEE({
                  ...ee,
                  spouse: {
                    education: v,
                    langCLBs: ee.spouse?.langCLBs || {
                      listening: 0,
                      reading: 0,
                      writing: 0,
                      speaking: 0
                    },
                    canadianWork: ee.spouse?.canadianWork || 0
                  }
                })
              }
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
                  onChange={(v) =>
                    setEE({
                      ...ee,
                      spouse: {
                        education: ee.spouse?.education || 'none',
                        langCLBs: {
                          ...(ee.spouse?.langCLBs || {
                            listening: 0,
                            reading: 0,
                            writing: 0,
                            speaking: 0
                          }),
                          [k]: v
                        },
                        canadianWork: ee.spouse?.canadianWork || 0
                      }
                    })
                  }
                />
              ))}
            </div>
            <NumberInput
              label="配偶加拿大工作经验"
              value={ee.spouse?.canadianWork || 0}
              min={0}
              max={5}
              onChange={(v) =>
                setEE({
                  ...ee,
                  spouse: {
                    education: ee.spouse?.education || 'none',
                    langCLBs: ee.spouse?.langCLBs || {
                      listening: 0,
                      reading: 0,
                      writing: 0,
                      speaking: 0
                    },
                    canadianWork: v
                  }
                })
              }
            />
          </>
        )}

        <h3>附加分</h3>
        <div className="grid-2">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={ee.provincialNomination}
              onChange={(e) => setEE({ ...ee, provincialNomination: e.target.checked })}
            />
            PNP 省提名 (+600)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={ee.siblingInCanada}
              onChange={(e) => setEE({ ...ee, siblingInCanada: e.target.checked })}
            />
            在加兄弟姐妹 (+15)
          </label>
          <SelectInput
            label="加拿大学历"
            value={ee.canadianEducation || 'none'}
            onChange={(v) =>
              setEE({
                ...ee,
                canadianEducation:
                  v === 'none' ? null : (v as EEFormData['canadianEducation'])
              })
            }
            options={[
              { value: 'none', label: '无' },
              { value: 'one_two_year', label: '1-2年 (+15)' },
              { value: 'three_plus', label: '3年及以上 (+30)' }
            ]}
          />
          <SelectInput
            label="法语加分"
            value={ee.frenchSkills || 'none'}
            onChange={(v) =>
              setEE({
                ...ee,
                frenchSkills: v === 'none' ? null : (v as EEFormData['frenchSkills'])
              })
            }
            options={[
              { value: 'none', label: '无' },
              { value: 'clb7_no_english', label: 'CLB7+且英语<CLB5 (+25)' },
              { value: 'clb7_any_english', label: 'CLB7+且英语达标 (+50)' }
            ]}
          />
        </div>
        <p className="muted">Job Offer CRS 加分已于 2025-03-25 取消。</p>
        <button className="calc-btn" onClick={() => setSubmittedEE(ee)}>
          计算
        </button>
      </div>

      <div className="card result">
        <h2>您的 CRS 得分结果</h2>
        <p className="muted">综合排名系统（CRS）总分满分 1,200 分。</p>

        <div className="crs-section">
          <div className="crs-section-title">核心人力资本因素</div>
          <div className="crs-row">
            <span>年龄</span>
            <span>{eeResult.sectionA.age}</span>
          </div>
          <div className="crs-row">
            <span>教育水平</span>
            <span>{eeResult.sectionA.education}</span>
          </div>
          <div className="crs-row">
            <span>官方语言</span>
            <span>{eeResult.sectionA.firstLang + eeResult.sectionA.secondLang}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>第一官方语言</span>
            <span>{eeResult.sectionA.firstLang}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>第二官方语言</span>
            <span>{eeResult.sectionA.secondLang}</span>
          </div>
          <div className="crs-row">
            <span>加拿大工作经验</span>
            <span>{eeResult.sectionA.canadianWork}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 核心人力资本因素</span>
            <span>{eeResult.sectionA.total}</span>
          </div>
        </div>

        <div className="crs-section">
          <div className="crs-section-title">配偶/同居伴侣因素</div>
          <div className="crs-row">
            <span>教育水平</span>
            <span>{eeResult.sectionB.education}</span>
          </div>
          <div className="crs-row">
            <span>第一官方语言</span>
            <span>{eeResult.sectionB.language}</span>
          </div>
          <div className="crs-row">
            <span>加拿大工作经验</span>
            <span>{eeResult.sectionB.work}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 配偶因素</span>
            <span>{eeResult.sectionB.total}</span>
          </div>
        </div>

        <div className="crs-section">
          <div className="crs-section-title">技能可转换因素</div>
          <div className="crs-row crs-group-label">
            <span>教育（最高 50 分）</span>
          </div>
          <div className="crs-row crs-indent">
            <span>A）官方语言能力 + 教育</span>
            <span>{eeResult.sectionC.c1}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>B）加拿大工作经验 + 教育</span>
            <span>{eeResult.sectionC.c2}</span>
          </div>
          <div className="crs-row crs-indent crs-subtotal">
            <span>小计</span>
            <span>{Math.min(50, eeResult.sectionC.c1 + eeResult.sectionC.c2)}</span>
          </div>
          <div className="crs-row crs-group-label">
            <span>境外工作经验（最高 50 分）</span>
          </div>
          <div className="crs-row crs-indent">
            <span>A）官方语言能力 + 境外工作经验</span>
            <span>{eeResult.sectionC.c3}</span>
          </div>
          <div className="crs-row crs-indent">
            <span>B）加拿大工作经验 + 境外工作经验</span>
            <span>{eeResult.sectionC.c4}</span>
          </div>
          <div className="crs-row crs-indent crs-subtotal">
            <span>小计</span>
            <span>{Math.min(50, eeResult.sectionC.c3 + eeResult.sectionC.c4)}</span>
          </div>
          <div className="crs-row">
            <span>行业资质证书</span>
            <span>{eeResult.sectionC.c5}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 技能可转换因素</span>
            <span>{eeResult.sectionC.total}</span>
          </div>
        </div>

        <div className="crs-section">
          <div className="crs-section-title">附加分（最高 600 分）</div>
          <div className="crs-row">
            <span>省/地区提名（PNP）</span>
            <span>{(eeResult.sectionD as Record<string, number>).provincialNomination ?? 0}</span>
          </div>
          <div className="crs-row">
            <span>加拿大留学经历</span>
            <span>{(eeResult.sectionD as Record<string, number>).canadianEducation ?? 0}</span>
          </div>
          <div className="crs-row">
            <span>在加拿大的兄弟姐妹</span>
            <span>{(eeResult.sectionD as Record<string, number>).siblingInCanada ?? 0}</span>
          </div>
          <div className="crs-row">
            <span>法语技能</span>
            <span>{(eeResult.sectionD as Record<string, number>).frenchSkills ?? 0}</span>
          </div>
          <div className="crs-row crs-subtotal">
            <span>小计 — 附加分</span>
            <span>{eeResult.sectionD.total}</span>
          </div>
        </div>

        <div className="crs-total-row">
          <span>CRS 综合排名系统总分</span>
          <span>{eeResult.total}</span>
        </div>
      </div>
    </section>
  );
}
