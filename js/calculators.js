// ============================================================
// calculators.js — CRS / BCPNP / OINP 计算逻辑（纯函数）
// ============================================================

// ----------------------------------------------------------
// 工具函数
// ----------------------------------------------------------

/**
 * 将 IELTS 单项成绩转换为 CLB
 * @param {string} skill - 'listening' | 'reading' | 'writing' | 'speaking'
 * @param {number} score - IELTS 分数
 * @returns {number} CLB 等级（最低返回3，表示CLB4以下）
 */
function ieltsToCLB(skill, score) {
  const table = IELTS_CLB[skill];
  if (!table) return 3;
  const parsed = parseFloat(score);
  if (isNaN(parsed)) return 3;
  for (const row of table) {
    if (parsed >= row.min) return row.clb;
  }
  return 3;
}

/**
 * CELPIP 成绩直接对应 CLB（1:1）
 */
function celpipToCLB(score) {
  const s = parseInt(score);
  if (isNaN(s)) return 3;
  return Math.max(3, Math.min(12, s));
}

/**
 * 安全取 CLB 表中的值，CLB>=10 返回 CLB 10 的分数
 */
function clbScore(table, clb) {
  const key = Math.min(Math.max(parseInt(clb) || 0, 0), 10);
  if (key <= 4) return table[4] || 0;
  return table[Math.min(key, 10)] || table[10] || 0;
}

/**
 * 安全取数组（按年数索引，超出取最大）
 */
function arrScore(arr, years) {
  const y = Math.max(0, Math.min(parseInt(years) || 0, arr.length - 1));
  return arr[y] || 0;
}

// ----------------------------------------------------------
// CRS 分项计算（Section A）
// ----------------------------------------------------------

function calcAgeScore(age, hasSpouse) {
  const a = parseInt(age) || 0;
  if (a < 18) return 0;
  if (a >= 45) return 0;
  const table = hasSpouse ? CRS_TABLES.ageSpouse : CRS_TABLES.ageNoSpouse;
  return table[a] || 0;
}

function calcEducationScore(edu, hasSpouse) {
  const table = hasSpouse ? CRS_TABLES.education.spouse : CRS_TABLES.education.noSpouse;
  return table[edu] || 0;
}

function calcFirstLangScore(clbs, hasSpouse) {
  // clbs = { listening, reading, writing, speaking } 各项CLB值
  const table = hasSpouse ? CRS_TABLES.firstLangSpouse : CRS_TABLES.firstLangNoSpouse;
  const skills = ['listening', 'reading', 'writing', 'speaking'];
  return skills.reduce((sum, s) => sum + clbScore(table, clbs[s] || 0), 0);
}

function calcSecondLangScore(clbs, hasSpouse) {
  if (!clbs) return 0;
  const table = CRS_TABLES.secondLang;
  const skills = ['listening', 'reading', 'writing', 'speaking'];
  const total = skills.reduce((sum, s) => sum + clbScore(table, clbs[s] || 0), 0);
  return hasSpouse ? Math.min(22, total) : total;
}

function calcCanadianWorkScore(years, hasSpouse) {
  const arr = hasSpouse ? CRS_TABLES.canadianWorkSpouse : CRS_TABLES.canadianWorkNoSpouse;
  return arrScore(arr, years);
}

// ----------------------------------------------------------
// CRS 分项计算（Section B — 配偶因素）
// ----------------------------------------------------------

function calcSpouseSection(spouseData) {
  if (!spouseData) return { education: 0, language: 0, work: 0, total: 0 };

  const education = CRS_TABLES.spouseEducation[spouseData.education] || 0;

  const langTable = CRS_TABLES.spouseLang;
  const skills = ['listening', 'reading', 'writing', 'speaking'];
  const language = skills.reduce((sum, s) =>
    sum + clbScore(langTable, spouseData.langCLBs?.[s] || 0), 0);

  const work = arrScore(CRS_TABLES.spouseWork, spouseData.canadianWork);

  return { education, language, work, total: education + language + work };
}

// ----------------------------------------------------------
// CRS 分项计算（Section C — 技能可转移）
// ----------------------------------------------------------

function calcSkillTransferability(data) {
  const {
    education,
    firstLangMinCLB,   // 第一语言4项中的最低CLB
    canadianWorkYears, // 加拿大工作经验年数(0-5)
    foreignWorkYears,  // 海外工作经验: 0, 1, 2 (0=无, 1=1-2年, 2=3年以上)
    hasCertificate     // 是否有行业认证证书
  } = data;

  const isHigherEdu = ['bachelors', 'two_or_more', 'masters', 'phd'].includes(education);
  const isPostSec   = ['one_year', 'two_year'].includes(education);
  const langCLB     = parseInt(firstLangMinCLB) || 0;
  const canWork     = parseInt(canadianWorkYears) || 0;
  const forWork     = parseInt(foreignWorkYears) || 0; // 0/1/2

  // 组合1：学历 + 第一语言（最高50分）
  let c1 = 0;
  if (isHigherEdu) {
    if (langCLB >= 9) c1 = 50;
    else if (langCLB >= 7) c1 = 25;
  } else if (isPostSec) {
    if (langCLB >= 9) c1 = 25;
    else if (langCLB >= 7) c1 = 13;
  }

  // 组合2：学历 + 加拿大工作经验（最高50分）
  let c2 = 0;
  if (isHigherEdu) {
    if (canWork >= 2) c2 = 50;
    else if (canWork >= 1) c2 = 25;
  } else if (isPostSec) {
    if (canWork >= 2) c2 = 25;
    else if (canWork >= 1) c2 = 13;
  }

  // 组合3：海外工作经验 + 第一语言（最高50分）
  let c3 = 0;
  if (forWork >= 2) { // 3年以上
    if (langCLB >= 9) c3 = 50;
    else if (langCLB >= 7) c3 = 25;
  } else if (forWork >= 1) { // 1-2年
    if (langCLB >= 9) c3 = 25;
    else if (langCLB >= 7) c3 = 13;
  }

  // 组合4：海外工作经验 + 加拿大工作经验（最高50分）
  let c4 = 0;
  if (forWork >= 2) {
    if (canWork >= 2) c4 = 50;
    else if (canWork >= 1) c4 = 25;
  } else if (forWork >= 1) {
    if (canWork >= 2) c4 = 25;
    else if (canWork >= 1) c4 = 13;
  }

  // 组合5：行业资质证书 + 第一语言（最高50分）
  let c5 = 0;
  if (hasCertificate) {
    if (langCLB >= 7) c5 = 50;
    else if (langCLB >= 5) c5 = 25;
  }

  const total = Math.min(100, c1 + c2 + c3 + c4 + c5);
  return { c1, c2, c3, c4, c5, total };
}

// ----------------------------------------------------------
// CRS 分项计算（Section D — 附加分）
// ----------------------------------------------------------

function calcAdditionalPoints(data) {
  let points = 0;
  const detail = {};

  // 省提名
  if (data.provincialNomination) {
    detail.provincialNomination = 600;
    points += 600;
  }

  // 加拿大学历
  if (data.canadianEducation === 'one_two_year') {
    detail.canadianEducation = 15;
    points += 15;
  } else if (data.canadianEducation === 'three_plus') {
    detail.canadianEducation = 30;
    points += 30;
  }

  // 法语能力
  if (data.frenchSkills === 'clb7_no_english') {
    detail.frenchSkills = 25;
    points += 25;
  } else if (data.frenchSkills === 'clb7_any_english') {
    detail.frenchSkills = 50;
    points += 50;
  }

  // 在加兄弟姐妹
  if (data.siblingInCanada) {
    detail.siblingInCanada = 15;
    points += 15;
  }

  return { ...detail, total: Math.min(600, points) };
}

// ----------------------------------------------------------
// 主计算函数：计算完整 CRS 分数
// ----------------------------------------------------------

/**
 * @param {Object} formData - 表单数据
 * @returns {Object} 详细分项分数及总分
 */
function calculateCRS(formData) {
  const hasSpouse = formData.maritalStatus === 'married';

  // 第一语言 CLBs（4项）
  const firstLangCLBs = formData.firstLangCLBs || { listening: 0, reading: 0, writing: 0, speaking: 0 };
  // 第一语言最低CLB（用于技能可转移计算）
  const firstLangMinCLB = Math.min(...Object.values(firstLangCLBs));

  // Section A
  const sA = {
    age:          calcAgeScore(formData.age, hasSpouse),
    education:    calcEducationScore(formData.education, hasSpouse),
    firstLang:    calcFirstLangScore(firstLangCLBs, hasSpouse),
    secondLang:   calcSecondLangScore(formData.secondLangCLBs, hasSpouse),
    canadianWork: calcCanadianWorkScore(formData.canadianWork, hasSpouse)
  };
  sA.total = sA.age + sA.education + sA.firstLang + sA.secondLang + sA.canadianWork;
  sA.max   = hasSpouse ? 460 : 500;

  // Section B
  const sB = calcSpouseSection(hasSpouse ? formData.spouse : null);
  sB.max = 40;

  // Section C
  const transferData = {
    education:       formData.education,
    firstLangMinCLB: firstLangMinCLB,
    canadianWorkYears: parseInt(formData.canadianWork) || 0,
    foreignWorkYears:  parseInt(formData.foreignWork) || 0,
    hasCertificate:    !!formData.hasCertificate
  };
  const sC = calcSkillTransferability(transferData);
  sC.max = 100;

  // Section D
  const sD = calcAdditionalPoints(formData);
  sD.max = 600;

  const total = sA.total + sB.total + sC.total + sD.total;

  return {
    total,
    sectionA: sA,
    sectionB: sB,
    sectionC: sC,
    sectionD: sD
  };
}

// ----------------------------------------------------------
// BCPNP SIRS 计算
// ----------------------------------------------------------

/**
 * @param {Object} formData - BCPNP 表单数据
 * @returns {Object} 分项 + 总分 + 资格评估
 */
function calculateBCPNP(formData) {
  const T = BCPNP_TABLES;
  const hourlyWage = parseFloat(formData.hourlyWage) || 0;
  let wageScore = 0;
  if (hourlyWage >= 70) wageScore = 55;
  else if (hourlyWage >= 16) wageScore = Math.floor(hourlyWage) - 15;

  // Human Capital (max 120)
  const workBase = T.directWorkBaseScore[formData.directWorkExp] || 0;
  const workCanada = formData.hasCanadaWorkExp ? T.directWorkCanadaBonus : 0;
  const workCurrentBC = formData.isCurrentBCJob ? T.directWorkCurrentBCBonus : 0;
  const workExpScore = workBase + workCanada + workCurrentBC;

  const eduBase = T.educationBaseScore[formData.educationLevel] || 0;
  const eduLoc = T.educationLocationBonus[formData.educationLocation] || 0;
  const eduDesignation = formData.hasProfessionalDesignation ? T.educationDesignationBonus : 0;
  const eduScore = eduBase + eduLoc + eduDesignation;

  const langCLB = parseInt(formData.langCLB) || 0;
  const langBase = langCLB >= 9 ? T.languageBaseScore[9] : (T.languageBaseScore[langCLB] || 0);
  const langDual = formData.hasDualLanguage ? T.languageDualBonus : 0;
  const langScore = langBase + langDual;

  const humanCapital = workExpScore + eduScore + langScore;

  // Economic (max 80)
  const areaBase = T.areaBaseScore[formData.area] || 0;
  const areaBonus = formData.hasRegionalBonus ? T.areaRegionalBonus : 0;
  const areaScore = areaBase + areaBonus;
  const economic = wageScore + areaScore;

  const total = humanCapital + economic;

  let eligible = true;
  const issues = [];
  if (!formData.hasJobOffer) {
    eligible = false;
    issues.push('BCPNP Skills Immigration 通常要求有效工作 Offer');
  }

  return {
    total,
    breakdown: {
      humanCapital: { score: humanCapital, max: 120 },
      economic: { score: economic, max: 80 },
      wage: { score: wageScore, max: 55 },
      area: { score: areaScore, max: 25 },
      workExp: { score: workExpScore, max: 40, base: workBase, canada: workCanada, current: workCurrentBC },
      education: { score: eduScore, max: 40, base: eduBase, location: eduLoc, designation: eduDesignation },
      language: { score: langScore, max: 40, base: langBase, dual: langDual }
    },
    eligible,
    issues
  };
}

// ----------------------------------------------------------
// OINP EOI 评分
// ----------------------------------------------------------

/**
 * @param {Object} data - OINP 表单数据
 * @returns {Object} 分项 + 总分
 */
function calculateOINPEOI(data) {
  const T = OINP_EOI_TABLES;
  const stream = data.stream || 'ejo_foreign_worker';
  const factors = T.streamFactors[stream] || [];

  const wage = parseFloat(data.hourlyWage) || 0;
  let wageScore = 0;
  for (const b of T.wageBands) {
    if (wage >= b.min) { wageScore = b.score; break; }
  }

  const langCLB = parseInt(data.langCLB) || 0;
  let langAbilityScore = 0;
  if (langCLB >= 9) langAbilityScore = T.languageAbilityScore[9];
  else if (langCLB >= 8) langAbilityScore = T.languageAbilityScore[8];
  else if (langCLB >= 7) langAbilityScore = T.languageAbilityScore[7];

  const allScores = {
    job_teer: T.nocTeerScore[data.nocTeer] || 0,
    job_broad: T.nocBroadScore[data.nocBroad] || 0,
    job_wage: wageScore,
    permit: data.hasValidPermit ? T.permitScore.valid : T.permitScore.invalid,
    tenure: data.jobTenure6m ? T.tenureScore.ge6m : T.tenureScore.lt6m,
    earnings: data.earnings40k ? T.earningsScore.ge40k : T.earningsScore.lt40k,
    education_level: T.educationScore[data.education] || 0,
    field: T.fieldScore[data.field] || 0,
    canadian_credential: T.canadianCredentialScore[data.canadianCredential] || 0,
    lang_ability: langAbilityScore,
    lang_knowledge: T.languageKnowledgeScore[data.langKnowledge] || 0,
    job_region: T.regionalScore[data.jobRegion] || 0,
    study_region: T.regionalScore[data.studyRegion] || 0
  };

  const detail = {};
  let total = 0;
  for (const factor of factors) {
    const value = allScores[factor] || 0;
    detail[factor] = value;
    total += value;
  }

  return { stream, total, detail };
}
