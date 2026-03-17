import type { Metadata } from 'next';
import { BCPNP_HISTORY, type HistoryRecord } from '@/lib/history';
import HistoryTable from '@/components/HistoryTable';

export const revalidate = 86400; // 24h ISR

export const metadata: Metadata = {
  title: 'BCPNP 邀请历史 | BC省提名抽签记录',
  description:
    'BC省提名 BCPNP Skills Immigration 邀请历史（2024至今）。每日自动更新，包含各轮次最低注册分数和邀请人数，涵盖 Tech Pilot 及一般类别。',
  alternates: { canonical: 'https://canada-immigration-tracker.vercel.app/bcpnp-history' },
  openGraph: { url: 'https://canada-immigration-tracker.vercel.app/bcpnp-history' }
};

type LiveHistoryPayload = {
  updated: string;
  ee: HistoryRecord[];
  bcpnp: HistoryRecord[];
  oinp: HistoryRecord[];
};

async function getBCPNPHistory(): Promise<{ data: HistoryRecord[]; updated: string | null }> {
  try {
    const res = await fetch('https://canada-immigration-tracker.vercel.app/data/history_data.json', {
      next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as Partial<LiveHistoryPayload>;
    if (!Array.isArray(payload.bcpnp)) throw new Error('invalid payload');
    return {
      data: payload.bcpnp,
      updated: typeof payload.updated === 'string' ? payload.updated : null
    };
  } catch {
    return { data: BCPNP_HISTORY, updated: null };
  }
}

export default async function BCPNPHistoryPage() {
  const { data, updated } = await getBCPNPHistory();

  return (
    <section className="panel">
      <div className="card">
        <h2>BCPNP 邀请历史</h2>
        {updated && <p className="muted">数据更新于 {updated}</p>}
        <HistoryTable data={data} />
      </div>
    </section>
  );
}
