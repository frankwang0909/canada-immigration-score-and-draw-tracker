import type { Metadata } from 'next';
import { EE_HISTORY, type HistoryRecord } from '@/lib/history';
import HistoryTable from '@/components/HistoryTable';

export const revalidate = 86400; // 24h ISR

export const metadata: Metadata = {
  title: 'EE 邀请历史',
  description:
    'Express Entry 联邦技术移民邀请历史记录。每日自动从 IRCC 官网抓取最新 EE 抽签数据，包括各类别最低 CRS 分数和邀请人数。'
};

type LiveHistoryPayload = {
  updated: string;
  ee: HistoryRecord[];
  bcpnp: HistoryRecord[];
  oinp: HistoryRecord[];
};

async function getEEHistory(): Promise<{ data: HistoryRecord[]; updated: string | null }> {
  try {
    const res = await fetch('https://canada-immigration-tracker.vercel.app/data/history_data.json', {
      next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as Partial<LiveHistoryPayload>;
    if (!Array.isArray(payload.ee)) throw new Error('invalid payload');
    return {
      data: payload.ee,
      updated: typeof payload.updated === 'string' ? payload.updated : null
    };
  } catch {
    return { data: EE_HISTORY, updated: null };
  }
}

export default async function EEHistoryPage() {
  const { data, updated } = await getEEHistory();

  return (
    <section className="panel">
      <div className="card">
        <h2>EE 邀请历史</h2>
        {updated && <p className="muted">数据更新于 {updated}</p>}
        <HistoryTable data={data} />
      </div>
    </section>
  );
}
