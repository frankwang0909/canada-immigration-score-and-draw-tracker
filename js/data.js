// ============================================================
// data.js — 评分数据表 + 历史邀请记录
// 数据来源：IRCC、BC PNP、OINP 官方公开资料（仅供参考）
// ============================================================

// ----------------------------------------------------------
// 1. CRS (Comprehensive Ranking System) 评分数据表
// ----------------------------------------------------------
const CRS_TABLES = {

  // 年龄得分 — 单身（最高110分）
  ageNoSpouse: {
    17: 0, 18: 99, 19: 105,
    20: 110, 21: 110, 22: 110, 23: 110, 24: 110,
    25: 110, 26: 110, 27: 110, 28: 110, 29: 110,
    30: 105, 31: 99, 32: 94, 33: 88, 34: 83,
    35: 77, 36: 72, 37: 66, 38: 61, 39: 55,
    40: 50, 41: 39, 42: 28, 43: 17, 44: 6
  },

  // 年龄得分 — 已婚（最高100分）
  ageSpouse: {
    17: 0, 18: 90, 19: 95,
    20: 100, 21: 100, 22: 100, 23: 100, 24: 100,
    25: 100, 26: 100, 27: 100, 28: 100, 29: 100,
    30: 95, 31: 90, 32: 85, 33: 80, 34: 75,
    35: 70, 36: 65, 37: 60, 38: 55, 39: 50,
    40: 45, 41: 35, 42: 25, 43: 15, 44: 5
  },

  // 学历得分
  education: {
    noSpouse: {
      none: 0, high_school: 30, one_year: 90, two_year: 98,
      bachelors: 120, two_or_more: 128, masters: 135, phd: 150
    },
    spouse: {
      none: 0, high_school: 28, one_year: 84, two_year: 91,
      bachelors: 112, two_or_more: 119, masters: 126, phd: 140
    }
  },

  // 第一官方语言每项CLB分数 — 单身（最高每项34分，总136分）
  firstLangNoSpouse: { 4: 0, 5: 6, 6: 9, 7: 17, 8: 23, 9: 31, 10: 34 },

  // 第一官方语言每项CLB分数 — 已婚（最高每项32分，总128分）
  firstLangSpouse: { 4: 0, 5: 6, 6: 8, 7: 16, 8: 22, 9: 29, 10: 32 },

  // 第二官方语言每项CLB分数（最高每项6分；已婚总分封顶22，单身24）
  secondLang: { 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 6, 10: 6 },

  // 加拿大工作经验得分 — 单身（下标=年数，最多取5）
  canadianWorkNoSpouse: [0, 40, 53, 64, 72, 80],

  // 加拿大工作经验得分 — 已婚
  canadianWorkSpouse: [0, 35, 46, 56, 63, 70],

  // 配偶学历（最高10分）
  spouseEducation: {
    none: 0, high_school: 2, one_year: 6, two_year: 7,
    bachelors: 8, two_or_more: 9, masters: 10, phd: 10
  },

  // 配偶第一官方语言每项CLB分数（最高每项5分，总20分）
  spouseLang: { 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 5, 10: 5 },

  // 配偶加拿大工作经验（下标=年数，最多取5，最高10分）
  spouseWork: [0, 5, 7, 8, 9, 10]
};

// ----------------------------------------------------------
// 2. IELTS → CLB 转换表
//    每项：评分 >= 该值 则达到对应 CLB
//    数组按 CLB 4→10+ 排列
// ----------------------------------------------------------
const IELTS_CLB = {
  listening: [
    { clb: 10, min: 8.5 },
    { clb: 9,  min: 8.0 },
    { clb: 8,  min: 7.5 },
    { clb: 7,  min: 6.0 },
    { clb: 6,  min: 5.5 },
    { clb: 5,  min: 5.0 },
    { clb: 4,  min: 4.5 }
  ],
  reading: [
    { clb: 10, min: 8.0 },
    { clb: 9,  min: 7.0 },
    { clb: 8,  min: 6.5 },
    { clb: 7,  min: 6.0 },
    { clb: 6,  min: 5.0 },
    { clb: 5,  min: 4.0 },
    { clb: 4,  min: 3.5 }
  ],
  writing: [
    { clb: 10, min: 7.5 },
    { clb: 9,  min: 7.0 },
    { clb: 8,  min: 6.5 },
    { clb: 7,  min: 6.0 },
    { clb: 6,  min: 5.5 },
    { clb: 5,  min: 5.0 },
    { clb: 4,  min: 4.0 }
  ],
  speaking: [
    { clb: 10, min: 8.0 },
    { clb: 9,  min: 7.5 },
    { clb: 8,  min: 7.0 },
    { clb: 7,  min: 6.0 },
    { clb: 6,  min: 5.5 },
    { clb: 5,  min: 5.0 },
    { clb: 4,  min: 4.0 }
  ]
};

// ----------------------------------------------------------
// 3. BCPNP Skills Immigration 评分数据表（官方 Guide 结构）
// ----------------------------------------------------------
const BCPNP_TABLES = {
  // 8.1 Directly related work experience（基础分）
  directWorkBaseScore: {
    no_experience: 0,
    lt_1: 1,
    y1_to_lt2: 4,
    y2_to_lt3: 8,
    y3_to_lt4: 12,
    y4_to_lt5: 16,
    y5_plus: 20
  },
  // 8.1 附加分
  directWorkCanadaBonus: 10, // 至少1年加拿大直接相关经验
  directWorkCurrentBCBonus: 10, // 当前在BC同雇主同职业全职

  // 8.2 Highest level of education（基础分）
  educationBaseScore: {
    secondary_or_less: 0,
    diploma_or_certificate: 5,
    associate_degree: 5,
    bachelors: 15,
    post_graduate: 15,
    masters: 22,
    doctoral: 27
  },
  // 8.2 附加分
  educationLocationBonus: {
    none: 0,
    bc: 8,
    canada_other: 6
  },
  educationDesignationBonus: 5, // BC合规职业资格

  // 8.3 Language proficiency
  languageBaseScore: { 4: 5, 5: 10, 6: 15, 7: 20, 8: 25, 9: 30 },
  languageDualBonus: 10, // 英法双语

  // 8.5 Area within B.C.
  areaBaseScore: {
    area1_mvrd: 0,
    area2_selected_cities: 5,
    area3_other_bc: 15
  },
  areaRegionalBonus: 10 // 区域经验或区域校友（二者取一）
};

// ----------------------------------------------------------
// 4. OINP EOI 评分数据表（Expression of Interest system）
// ----------------------------------------------------------
const OINP_EOI_TABLES = {
  // 就业/劳动力市场因子
  nocTeerScore: { teer01: 10, teer23: 8, teer45: 0 },
  nocBroadScore: {
    cat023: 10,
    cat7: 7,
    cat19: 5,
    cat48: 4,
    cat56: 3
  },
  wageBands: [
    { min: 40, score: 10 },
    { min: 35, score: 8 },
    { min: 30, score: 7 },
    { min: 25, score: 6 },
    { min: 20, score: 5 },
    { min: 0, score: 0 }
  ],
  permitScore: { valid: 10, invalid: 0 },
  tenureScore: { ge6m: 3, lt6m: 0 },
  earningsScore: { ge40k: 3, lt40k: 0 },

  // 教育因子
  educationScore: {
    less_than_college: 0,
    trade_or_apprenticeship: 5,
    undergrad_diploma_or_certificate: 5,
    graduate_diploma_or_certificate: 6,
    bachelors: 6,
    masters: 8,
    phd_or_md: 10
  },
  fieldScore: {
    stem_health_trades: 12,
    business_social_services: 6,
    arts_humanities_bhase: 0
  },
  canadianCredentialScore: {
    none: 0,
    one: 5,
    more_than_one: 10
  },

  // 语言因子
  languageAbilityScore: { 9: 10, 8: 6, 7: 4 },
  languageKnowledgeScore: {
    one_official: 5,
    two_officials: 10
  },

  // 区域化
  regionalScore: {
    toronto: 0,
    gta_not_toronto: 3,
    outside_gta_not_north: 8,
    northern_ontario: 10,
    not_in_person: 0
  },

  // 各 stream 应用的因子
  streamFactors: {
    ejo_foreign_worker: [
      'job_teer', 'job_broad', 'job_wage', 'permit', 'tenure', 'earnings',
      'lang_ability', 'lang_knowledge', 'job_region'
    ],
    ejo_in_demand: [
      'job_broad', 'job_wage', 'permit', 'tenure', 'earnings', 'job_region'
    ],
    ejo_international_student: [
      'job_teer', 'job_broad', 'job_wage', 'permit', 'tenure', 'earnings',
      'education_level', 'field', 'canadian_credential',
      'lang_ability', 'lang_knowledge', 'job_region', 'study_region'
    ],
    masters_graduate: [
      'permit', 'earnings', 'education_level', 'field',
      'canadian_credential', 'lang_ability', 'lang_knowledge', 'study_region'
    ],
    phd_graduate: [
      'permit', 'earnings', 'education_level', 'field',
      'canadian_credential', 'lang_ability', 'lang_knowledge', 'study_region'
    ]
  }
};

// ----------------------------------------------------------
// 5. 学历选项标签（中文）
// ----------------------------------------------------------
const EDU_LABELS = {
  none:        '无正式学历',
  high_school: '高中文凭',
  one_year:    '1年制大专/证书',
  two_year:    '2年制大专/证书',
  bachelors:   '学士/3年以上本科',
  two_or_more: '两个或以上证书（含3年制）',
  masters:     '硕士/专业学位',
  phd:         '博士（PhD）'
};

// ----------------------------------------------------------
// 6. EE 历史邀请记录（近12个月，仅供参考）
// ----------------------------------------------------------
const EE_HISTORY = [
  { date: '2025-03-05', type: 'CEC',    cutoff: 531, invited: 4000 },
  { date: '2025-02-19', type: '全类别', cutoff: 538, invited: 2500 },
  { date: '2025-02-05', type: 'CEC',    cutoff: 528, invited: 4500 },
  { date: '2025-01-22', type: '全类别', cutoff: 535, invited: 2000 },
  { date: '2025-01-08', type: 'CEC',    cutoff: 522, invited: 4500 },
  { date: '2024-12-18', type: '全类别', cutoff: 545, invited: 3000 },
  { date: '2024-12-04', type: 'CEC',    cutoff: 534, invited: 4500 },
  { date: '2024-11-20', type: '全类别', cutoff: 543, invited: 2000 },
  { date: '2024-11-06', type: 'CEC',    cutoff: 536, invited: 4400 },
  { date: '2024-10-23', type: '全类别', cutoff: 525, invited: 2000 },
  { date: '2024-10-09', type: 'CEC',    cutoff: 524, invited: 4500 },
  { date: '2024-09-25', type: 'STEM',   cutoff: 491, invited: 5000 },
  { date: '2024-09-11', type: 'CEC',    cutoff: 527, invited: 4000 },
  { date: '2024-08-28', type: '全类别', cutoff: 530, invited: 2000 },
  { date: '2024-08-14', type: 'CEC',    cutoff: 519, invited: 4200 },
  { date: '2024-07-31', type: '全类别', cutoff: 534, invited: 3000 },
  { date: '2024-07-17', type: 'CEC',    cutoff: 507, invited: 4500 },
  { date: '2024-07-03', type: 'STEM',   cutoff: 487, invited: 4800 },
  { date: '2024-06-19', type: 'CEC',    cutoff: 510, invited: 4500 },
  { date: '2024-06-05', type: '全类别', cutoff: 524, invited: 4000 },
  { date: '2024-05-22', type: 'CEC',    cutoff: 516, invited: 4500 },
  { date: '2024-05-01', type: '全类别', cutoff: 529, invited: 2000 },
  { date: '2024-04-17', type: 'CEC',    cutoff: 509, invited: 4200 },
  { date: '2024-04-03', type: '全类别', cutoff: 525, invited: 2000 }
];

// ----------------------------------------------------------
// 7. BCPNP 历史邀请记录（近12个月，仅供参考）
// ----------------------------------------------------------
const BCPNP_HISTORY = [
  { date: '2025-02-25', type: 'Tech Pilot',  cutoff: 110, invited: 250 },
  { date: '2025-02-11', type: '技术工人/国际毕业生', cutoff: 95,  invited: 300 },
  { date: '2025-01-28', type: 'Tech Pilot',  cutoff: 108, invited: 200 },
  { date: '2025-01-14', type: '技术工人/国际毕业生', cutoff: 92,  invited: 280 },
  { date: '2024-12-17', type: 'Tech Pilot',  cutoff: 105, invited: 220 },
  { date: '2024-12-03', type: '技术工人/国际毕业生', cutoff: 88,  invited: 320 },
  { date: '2024-11-19', type: 'Tech Pilot',  cutoff: 112, invited: 180 },
  { date: '2024-11-05', type: '技术工人/国际毕业生', cutoff: 90,  invited: 300 },
  { date: '2024-10-22', type: 'Tech Pilot',  cutoff: 107, invited: 210 },
  { date: '2024-10-08', type: '技术工人/国际毕业生', cutoff: 86,  invited: 310 },
  { date: '2024-09-24', type: 'Tech Pilot',  cutoff: 103, invited: 240 },
  { date: '2024-09-10', type: '技术工人/国际毕业生', cutoff: 85,  invited: 290 },
  { date: '2024-08-27', type: 'Tech Pilot',  cutoff: 100, invited: 230 },
  { date: '2024-08-13', type: '技术工人/国际毕业生', cutoff: 83,  invited: 280 },
  { date: '2024-07-30', type: 'Tech Pilot',  cutoff: 98,  invited: 220 },
  { date: '2024-07-16', type: '技术工人/国际毕业生', cutoff: 80,  invited: 300 },
  { date: '2024-07-02', type: 'Tech Pilot',  cutoff: 102, invited: 200 },
  { date: '2024-06-18', type: '技术工人/国际毕业生', cutoff: 82,  invited: 270 },
  { date: '2024-06-04', type: 'Tech Pilot',  cutoff: 99,  invited: 210 },
  { date: '2024-05-21', type: '技术工人/国际毕业生', cutoff: 79,  invited: 260 },
  { date: '2024-05-07', type: 'Tech Pilot',  cutoff: 96,  invited: 230 },
  { date: '2024-04-23', type: '技术工人/国际毕业生', cutoff: 77,  invited: 250 },
  { date: '2024-04-09', type: 'Tech Pilot',  cutoff: 94,  invited: 220 },
  { date: '2024-03-26', type: '技术工人/国际毕业生', cutoff: 75,  invited: 240 }
];

// ----------------------------------------------------------
// 8. OINP 历史邀请记录（近12个月，仅供参考）
// ----------------------------------------------------------
const OINP_HISTORY = [
  { date: '2025-02-20', type: '雇主担保-国际学生',  cutoff: null, invited: 600 },
  { date: '2025-01-30', type: '雇主担保-外国工人',  cutoff: null, invited: 400 },
  { date: '2025-01-16', type: '人力资本优先(HCP)',  cutoff: 491,  invited: 1000 },
  { date: '2024-12-12', type: '硕士毕业生',         cutoff: null, invited: 300 },
  { date: '2024-12-05', type: '雇主担保-国际学生',  cutoff: null, invited: 550 },
  { date: '2024-11-21', type: '人力资本优先(HCP)',  cutoff: 494,  invited: 900 },
  { date: '2024-11-07', type: '雇主担保-外国工人',  cutoff: null, invited: 380 },
  { date: '2024-10-24', type: '法语技术工人',        cutoff: null, invited: 150 },
  { date: '2024-10-10', type: '人力资本优先(HCP)',  cutoff: 489,  invited: 1200 },
  { date: '2024-09-26', type: '雇主担保-国际学生',  cutoff: null, invited: 500 },
  { date: '2024-09-12', type: '人力资本优先(HCP)',  cutoff: 485,  invited: 1100 },
  { date: '2024-08-29', type: '雇主担保-外国工人',  cutoff: null, invited: 350 },
  { date: '2024-08-15', type: '硕士毕业生',         cutoff: null, invited: 280 },
  { date: '2024-07-25', type: '人力资本优先(HCP)',  cutoff: 487,  invited: 950 },
  { date: '2024-07-11', type: '雇主担保-国际学生',  cutoff: null, invited: 480 },
  { date: '2024-06-27', type: '人力资本优先(HCP)',  cutoff: 492,  invited: 850 },
  { date: '2024-06-13', type: '雇主担保-外国工人',  cutoff: null, invited: 360 },
  { date: '2024-05-30', type: '博士毕业生',         cutoff: null, invited: 100 },
  { date: '2024-05-16', type: '人力资本优先(HCP)',  cutoff: 488,  invited: 1000 },
  { date: '2024-05-02', type: '雇主担保-国际学生',  cutoff: null, invited: 450 },
  { date: '2024-04-18', type: '人力资本优先(HCP)',  cutoff: 490,  invited: 900 },
  { date: '2024-04-04', type: '雇主担保-外国工人',  cutoff: null, invited: 340 }
];
