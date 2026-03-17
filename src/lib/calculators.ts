export type MaritalStatus = 'single' | 'married';

export type LangCLB = {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

export type EEFormData = {
  maritalStatus: MaritalStatus;
  age: number;
  education: string;
  firstLangCLBs: LangCLB;
  secondLangCLBs: LangCLB | null;
  canadianWork: number;
  foreignWork: number;
  hasCertificate: boolean;
  spouse?: {
    education: string;
    langCLBs: LangCLB;
    canadianWork: number;
  };
  provincialNomination: boolean;
  canadianEducation: 'one_two_year' | 'three_plus' | null;
  frenchSkills: 'clb7_no_english' | 'clb7_any_english' | null;
  siblingInCanada: boolean;
};

export type BCFormData = {
  hasJobOffer: boolean;
  hourlyWage: number;
  directWorkExp: string;
  hasCanadaWorkExp: boolean;
  isCurrentBCJob: boolean;
  educationLevel: string;
  educationLocation: string;
  hasProfessionalDesignation: boolean;
  langCLB: number;
  hasDualLanguage: boolean;
  area: string;
  hasRegionalBonus: boolean;
};

export type OINPFormData = {
  stream: string;
  nocTeer: string;
  nocBroad: string;
  hourlyWage: number;
  hasValidPermit: boolean;
  jobTenure6m: boolean;
  earnings40k: boolean;
  education: string;
  field: string;
  canadianCredential: string;
  langCLB: number;
  langKnowledge: string;
  jobRegion: string;
  studyRegion: string;
};

const CRS_TABLES = {
  ageNoSpouse: {
    17: 0, 18: 99, 19: 105,
    20: 110, 21: 110, 22: 110, 23: 110, 24: 110,
    25: 110, 26: 110, 27: 110, 28: 110, 29: 110,
    30: 105, 31: 99, 32: 94, 33: 88, 34: 83,
    35: 77, 36: 72, 37: 66, 38: 61, 39: 55,
    40: 50, 41: 39, 42: 28, 43: 17, 44: 6
  } as Record<number, number>,
  ageSpouse: {
    17: 0, 18: 90, 19: 95,
    20: 100, 21: 100, 22: 100, 23: 100, 24: 100,
    25: 100, 26: 100, 27: 100, 28: 100, 29: 100,
    30: 95, 31: 90, 32: 85, 33: 80, 34: 75,
    35: 70, 36: 65, 37: 60, 38: 55, 39: 50,
    40: 45, 41: 35, 42: 25, 43: 15, 44: 5
  } as Record<number, number>,
  education: {
    noSpouse: {
      none: 0, high_school: 30, one_year: 90, two_year: 98,
      bachelors: 120, two_or_more: 128, masters: 135, phd: 150
    } as Record<string, number>,
    spouse: {
      none: 0, high_school: 28, one_year: 84, two_year: 91,
      bachelors: 112, two_or_more: 119, masters: 126, phd: 140
    } as Record<string, number>
  },
  firstLangNoSpouse: { 4: 0, 5: 6, 6: 9, 7: 17, 8: 23, 9: 31, 10: 34 },
  firstLangSpouse: { 4: 0, 5: 6, 6: 8, 7: 16, 8: 22, 9: 29, 10: 32 },
  secondLang: { 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 6, 10: 6 },
  canadianWorkNoSpouse: [0, 40, 53, 64, 72, 80],
  canadianWorkSpouse: [0, 35, 46, 56, 63, 70],
  spouseEducation: {
    none: 0, high_school: 2, one_year: 6, two_year: 7,
    bachelors: 8, two_or_more: 9, masters: 10, phd: 10
  } as Record<string, number>,
  spouseLang: { 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 5, 10: 5 },
  spouseWork: [0, 5, 7, 8, 9, 10]
};

const BCPNP_TABLES = {
  directWorkBaseScore: {
    no_experience: 0,
    lt_1: 1,
    y1_to_lt2: 4,
    y2_to_lt3: 8,
    y3_to_lt4: 12,
    y4_to_lt5: 16,
    y5_plus: 20
  } as Record<string, number>,
  directWorkCanadaBonus: 10,
  directWorkCurrentBCBonus: 10,
  educationBaseScore: {
    secondary_or_less: 0,
    diploma_or_certificate: 5,
    associate_degree: 5,
    bachelors: 15,
    post_graduate: 15,
    masters: 22,
    doctoral: 27
  } as Record<string, number>,
  educationLocationBonus: {
    none: 0,
    bc: 8,
    canada_other: 6
  } as Record<string, number>,
  educationDesignationBonus: 5,
  languageBaseScore: { 4: 5, 5: 10, 6: 15, 7: 20, 8: 25, 9: 30 } as Record<number, number>,
  languageDualBonus: 10,
  areaBaseScore: {
    area1_mvrd: 0,
    area2_selected_cities: 5,
    area3_other_bc: 15
  } as Record<string, number>,
  areaRegionalBonus: 10
};

const OINP_EOI_TABLES = {
  nocTeerScore: { teer01: 10, teer23: 8, teer45: 0 } as Record<string, number>,
  nocBroadScore: {
    cat023: 10,
    cat7: 7,
    cat19: 5,
    cat48: 4,
    cat56: 3
  } as Record<string, number>,
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
  educationScore: {
    less_than_college: 0,
    trade_or_apprenticeship: 5,
    undergrad_diploma_or_certificate: 5,
    graduate_diploma_or_certificate: 6,
    bachelors: 6,
    masters: 8,
    phd_or_md: 10
  } as Record<string, number>,
  fieldScore: {
    stem_health_trades: 12,
    business_social_services: 6,
    arts_humanities_bhase: 0
  } as Record<string, number>,
  canadianCredentialScore: {
    none: 0,
    one: 5,
    more_than_one: 10
  } as Record<string, number>,
  languageAbilityScore: { 9: 10, 8: 6, 7: 4 } as Record<number, number>,
  languageKnowledgeScore: {
    one_official: 5,
    two_officials: 10
  } as Record<string, number>,
  regionalScore: {
    toronto: 0,
    gta_not_toronto: 3,
    outside_gta_not_north: 8,
    northern_ontario: 10,
    not_in_person: 0
  } as Record<string, number>,
  streamFactors: {
    ejo_foreign_worker: [
      'job_teer', 'job_broad', 'job_wage', 'permit', 'tenure', 'earnings',
      'lang_ability', 'lang_knowledge', 'job_region'
    ],
    ejo_in_demand: ['job_broad', 'job_wage', 'permit', 'tenure', 'earnings', 'job_region'],
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
  } as Record<string, string[]>
};

function clbScore(table: Record<number, number>, clb: number): number {
  const key = Math.min(Math.max(Math.trunc(clb) || 0, 0), 10);
  if (key <= 4) return table[4] || 0;
  return table[key] || table[10] || 0;
}

function arrScore(arr: number[], years: number): number {
  const y = Math.max(0, Math.min(Math.trunc(years) || 0, arr.length - 1));
  return arr[y] || 0;
}

function calcSkillTransferability(data: {
  education: string;
  firstLangMinCLB: number;
  canadianWorkYears: number;
  foreignWorkYears: number;
  hasCertificate: boolean;
}) {
  const isHigherEdu = ['bachelors', 'two_or_more', 'masters', 'phd'].includes(data.education);
  const isPostSec = ['one_year', 'two_year'].includes(data.education);
  const langCLB = Math.trunc(data.firstLangMinCLB) || 0;
  const canWork = Math.trunc(data.canadianWorkYears) || 0;
  const forWork = Math.trunc(data.foreignWorkYears) || 0;

  let c1 = 0;
  if (isHigherEdu) {
    if (langCLB >= 9) c1 = 50;
    else if (langCLB >= 7) c1 = 25;
  } else if (isPostSec) {
    if (langCLB >= 9) c1 = 25;
    else if (langCLB >= 7) c1 = 13;
  }

  let c2 = 0;
  if (isHigherEdu) {
    if (canWork >= 2) c2 = 50;
    else if (canWork >= 1) c2 = 25;
  } else if (isPostSec) {
    if (canWork >= 2) c2 = 25;
    else if (canWork >= 1) c2 = 13;
  }

  let c3 = 0;
  if (forWork >= 2) {
    if (langCLB >= 9) c3 = 50;
    else if (langCLB >= 7) c3 = 25;
  } else if (forWork >= 1) {
    if (langCLB >= 9) c3 = 25;
    else if (langCLB >= 7) c3 = 13;
  }

  let c4 = 0;
  if (forWork >= 2) {
    if (canWork >= 2) c4 = 50;
    else if (canWork >= 1) c4 = 25;
  } else if (forWork >= 1) {
    if (canWork >= 2) c4 = 25;
    else if (canWork >= 1) c4 = 13;
  }

  let c5 = 0;
  if (data.hasCertificate) {
    if (langCLB >= 7) c5 = 50;
    else if (langCLB >= 5) c5 = 25;
  }

  // 每组各自上限 50，整体上限 100
  const eduGroup     = Math.min(50, c1 + c2);
  const foreignGroup = Math.min(50, c3 + c4);
  const certGroup    = Math.min(50, c5);
  return { c1, c2, c3, c4, c5, total: Math.min(100, eduGroup + foreignGroup + certGroup) };
}

export function calculateCRS(formData: EEFormData) {
  const hasSpouse = formData.maritalStatus === 'married';
  const firstLangCLBs = formData.firstLangCLBs;
  const firstLangMinCLB = Math.min(...Object.values(firstLangCLBs));

  const age = (() => {
    const a = Math.trunc(formData.age) || 0;
    if (a < 18 || a >= 45) return 0;
    return (hasSpouse ? CRS_TABLES.ageSpouse : CRS_TABLES.ageNoSpouse)[a] || 0;
  })();

  const edu = (hasSpouse ? CRS_TABLES.education.spouse : CRS_TABLES.education.noSpouse)[formData.education] || 0;
  const firstLangTable = hasSpouse ? CRS_TABLES.firstLangSpouse : CRS_TABLES.firstLangNoSpouse;
  const skills: Array<keyof LangCLB> = ['listening', 'reading', 'writing', 'speaking'];
  const firstLang = skills.reduce((sum, s) => sum + clbScore(firstLangTable, firstLangCLBs[s] || 0), 0);

  let secondLang = 0;
  if (formData.secondLangCLBs) {
    secondLang = skills.reduce((sum, s) => sum + clbScore(CRS_TABLES.secondLang, formData.secondLangCLBs?.[s] || 0), 0);
    secondLang = hasSpouse ? Math.min(22, secondLang) : secondLang;
  }

  const canadianWork = arrScore(hasSpouse ? CRS_TABLES.canadianWorkSpouse : CRS_TABLES.canadianWorkNoSpouse, formData.canadianWork);
  const sectionA = { age, education: edu, firstLang, secondLang, canadianWork, total: age + edu + firstLang + secondLang + canadianWork, max: hasSpouse ? 460 : 500 };

  const spouse = hasSpouse && formData.spouse ? {
    education: CRS_TABLES.spouseEducation[formData.spouse.education] || 0,
    language: skills.reduce((sum, s) => sum + clbScore(CRS_TABLES.spouseLang, formData.spouse?.langCLBs?.[s] || 0), 0),
    work: arrScore(CRS_TABLES.spouseWork, formData.spouse.canadianWork),
    total: 0,
    max: 40
  } : { education: 0, language: 0, work: 0, total: 0, max: 40 };
  spouse.total = spouse.education + spouse.language + spouse.work;

  const sectionC = {
    ...calcSkillTransferability({
      education: formData.education,
      firstLangMinCLB,
      canadianWorkYears: formData.canadianWork,
      foreignWorkYears: formData.foreignWork,
      hasCertificate: formData.hasCertificate
    }),
    max: 100
  };

  let add = 0;
  const detail: Record<string, number> = {};
  if (formData.provincialNomination) { detail.provincialNomination = 600; add += 600; }
  if (formData.canadianEducation === 'one_two_year') { detail.canadianEducation = 15; add += 15; }
  if (formData.canadianEducation === 'three_plus') { detail.canadianEducation = 30; add += 30; }
  if (formData.frenchSkills === 'clb7_no_english') { detail.frenchSkills = 25; add += 25; }
  if (formData.frenchSkills === 'clb7_any_english') { detail.frenchSkills = 50; add += 50; }
  if (formData.siblingInCanada) { detail.siblingInCanada = 15; add += 15; }
  const sectionD = { ...detail, total: Math.min(600, add), max: 600 };

  return {
    total: sectionA.total + spouse.total + sectionC.total + sectionD.total,
    sectionA,
    sectionB: spouse,
    sectionC,
    sectionD
  };
}

export function calculateBCPNP(formData: BCFormData) {
  const wage = formData.hourlyWage || 0;
  let wageScore = 0;
  if (wage >= 70) wageScore = 55;
  else if (wage >= 16) wageScore = Math.floor(wage) - 15;

  const workBase = BCPNP_TABLES.directWorkBaseScore[formData.directWorkExp] || 0;
  const workCanada = formData.hasCanadaWorkExp ? BCPNP_TABLES.directWorkCanadaBonus : 0;
  const workCurrent = formData.isCurrentBCJob ? BCPNP_TABLES.directWorkCurrentBCBonus : 0;
  const workExp = workBase + workCanada + workCurrent;

  const eduBase = BCPNP_TABLES.educationBaseScore[formData.educationLevel] || 0;
  const eduLoc = BCPNP_TABLES.educationLocationBonus[formData.educationLocation] || 0;
  const eduDes = formData.hasProfessionalDesignation ? BCPNP_TABLES.educationDesignationBonus : 0;
  const education = eduBase + eduLoc + eduDes;

  const clb = Math.trunc(formData.langCLB) || 0;
  const langBase = clb >= 9 ? BCPNP_TABLES.languageBaseScore[9] : (BCPNP_TABLES.languageBaseScore[clb] || 0);
  const langDual = formData.hasDualLanguage ? BCPNP_TABLES.languageDualBonus : 0;
  const language = langBase + langDual;

  const humanCapital = workExp + education + language;
  const areaBase = BCPNP_TABLES.areaBaseScore[formData.area] || 0;
  const areaBonus = formData.hasRegionalBonus ? BCPNP_TABLES.areaRegionalBonus : 0;
  const area = areaBase + areaBonus;
  const economic = wageScore + area;

  return {
    total: humanCapital + economic,
    breakdown: {
      humanCapital: { score: humanCapital, max: 120 },
      economic: { score: economic, max: 80 },
      wage: { score: wageScore, max: 55 },
      area: { score: area, max: 25 },
      workExp: { score: workExp, max: 40, base: workBase, canada: workCanada, current: workCurrent },
      education: { score: education, max: 40, base: eduBase, location: eduLoc, designation: eduDes },
      language: { score: language, max: 40, base: langBase, dual: langDual }
    }
  };
}

export function calculateOINPEOI(data: OINPFormData) {
  const factors = OINP_EOI_TABLES.streamFactors[data.stream] || [];

  let wageScore = 0;
  for (const b of OINP_EOI_TABLES.wageBands) {
    if (data.hourlyWage >= b.min) {
      wageScore = b.score;
      break;
    }
  }

  let langAbility = 0;
  if (data.langCLB >= 9) langAbility = OINP_EOI_TABLES.languageAbilityScore[9];
  else if (data.langCLB >= 8) langAbility = OINP_EOI_TABLES.languageAbilityScore[8];
  else if (data.langCLB >= 7) langAbility = OINP_EOI_TABLES.languageAbilityScore[7];

  const allScores: Record<string, number> = {
    job_teer: OINP_EOI_TABLES.nocTeerScore[data.nocTeer] || 0,
    job_broad: OINP_EOI_TABLES.nocBroadScore[data.nocBroad] || 0,
    job_wage: wageScore,
    permit: data.hasValidPermit ? OINP_EOI_TABLES.permitScore.valid : OINP_EOI_TABLES.permitScore.invalid,
    tenure: data.jobTenure6m ? OINP_EOI_TABLES.tenureScore.ge6m : OINP_EOI_TABLES.tenureScore.lt6m,
    earnings: data.earnings40k ? OINP_EOI_TABLES.earningsScore.ge40k : OINP_EOI_TABLES.earningsScore.lt40k,
    education_level: OINP_EOI_TABLES.educationScore[data.education] || 0,
    field: OINP_EOI_TABLES.fieldScore[data.field] || 0,
    canadian_credential: OINP_EOI_TABLES.canadianCredentialScore[data.canadianCredential] || 0,
    lang_ability: langAbility,
    lang_knowledge: OINP_EOI_TABLES.languageKnowledgeScore[data.langKnowledge] || 0,
    job_region: OINP_EOI_TABLES.regionalScore[data.jobRegion] || 0,
    study_region: OINP_EOI_TABLES.regionalScore[data.studyRegion] || 0
  };

  const detail: Record<string, number> = {};
  let total = 0;
  for (const factor of factors) {
    const v = allScores[factor] || 0;
    detail[factor] = v;
    total += v;
  }

  return { total, detail, stream: data.stream };
}
