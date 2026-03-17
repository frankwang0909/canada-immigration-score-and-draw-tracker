import type { Metadata } from 'next';
import { OINP_HISTORY, type HistoryRecord } from '@/lib/history';
import HistoryTable from '@/components/HistoryTable';

export const revalidate = 86400; // 24h ISR

export const metadata: Metadata = {
  title: 'OINP 邀请历史 | 安省提名抽签记录',
  description:
    '安省提名 OINP 邀请历史（2024至今）。每日自动更新，包含各 Stream 邀请轮次、最低 EOI 分数和邀请人数，含 Employer Job Offer、Masters/PhD Graduate 等类别。',
  alternates: { canonical: 'https://score.debugcanada.com/oinp-history' },
  openGraph: { url: 'https://score.debugcanada.com/oinp-history' }
};

type LiveHistoryPayload = {
  updated: string;
  ee: HistoryRecord[];
  bcpnp: HistoryRecord[];
  oinp: HistoryRecord[];
};

async function getOINPHistory(): Promise<{ data: HistoryRecord[]; updated: string | null }> {
  try {
    const res = await fetch('https://score.debugcanada.com/data/history_data.json', {
      next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as Partial<LiveHistoryPayload>;
    if (!Array.isArray(payload.oinp)) throw new Error('invalid payload');
    return {
      data: payload.oinp,
      updated: typeof payload.updated === 'string' ? payload.updated : null
    };
  } catch {
    return { data: OINP_HISTORY, updated: null };
  }
}

export default async function OINPHistoryPage() {
  const { data, updated } = await getOINPHistory();

  return (
    <section className="panel">
      <div className="card">
        <h2>OINP 邀请历史</h2>
        {updated && <p className="muted">数据更新于 {updated}</p>}
        <HistoryTable data={data} />
      </div>
    </section>
  );
}
