export type HistoryRecord = {
  date: string;
  type: string;
  cutoff: number | null;
  invited: number | null;
};

export const EE_HISTORY: HistoryRecord[] = [
  { date: '2025-03-05', type: 'CEC', cutoff: 531, invited: 4000 },
  { date: '2025-02-19', type: '全类别', cutoff: 538, invited: 2500 },
  { date: '2025-02-05', type: 'CEC', cutoff: 528, invited: 4500 },
  { date: '2025-01-22', type: '全类别', cutoff: 535, invited: 2000 },
  { date: '2025-01-08', type: 'CEC', cutoff: 522, invited: 4500 },
  { date: '2024-12-18', type: '全类别', cutoff: 545, invited: 3000 },
  { date: '2024-12-04', type: 'CEC', cutoff: 534, invited: 4500 },
  { date: '2024-11-20', type: '全类别', cutoff: 543, invited: 2000 },
  { date: '2024-11-06', type: 'CEC', cutoff: 536, invited: 4400 },
  { date: '2024-10-23', type: '全类别', cutoff: 525, invited: 2000 },
  { date: '2024-10-09', type: 'CEC', cutoff: 524, invited: 4500 },
  { date: '2024-09-25', type: 'STEM', cutoff: 491, invited: 5000 }
];

export const BCPNP_HISTORY: HistoryRecord[] = [
  { date: '2025-02-25', type: 'Tech', cutoff: 110, invited: 250 },
  { date: '2025-02-11', type: '技术工人/国际毕业生', cutoff: 95, invited: 300 },
  { date: '2025-01-28', type: 'Tech', cutoff: 108, invited: 200 },
  { date: '2025-01-14', type: '技术工人/国际毕业生', cutoff: 92, invited: 280 },
  { date: '2024-12-17', type: 'Tech', cutoff: 105, invited: 220 },
  { date: '2024-12-03', type: '技术工人/国际毕业生', cutoff: 88, invited: 320 }
];

export const OINP_HISTORY: HistoryRecord[] = [
  { date: '2025-02-20', type: '雇主担保-国际学生', cutoff: null, invited: 600 },
  { date: '2025-01-30', type: '雇主担保-外国工人', cutoff: null, invited: 400 },
  { date: '2025-01-16', type: '人力资本优先(HCP)', cutoff: 491, invited: 1000 },
  { date: '2024-12-12', type: '硕士毕业生', cutoff: null, invited: 300 },
  { date: '2024-12-05', type: '雇主担保-国际学生', cutoff: null, invited: 550 }
];
