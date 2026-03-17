import type { HistoryRecord } from '@/lib/history';

export default function HistoryTable({ data }: { data: HistoryRecord[] }) {
  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>日期</th>
          <th>轮次</th>
          <th>最低分</th>
          <th>邀请人数</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={`${row.date}-${row.type}-${row.cutoff ?? 'null'}-${row.invited ?? 'null'}`}>
            <td>{row.date}</td>
            <td>{row.type}</td>
            <td>{row.cutoff ?? '-'}</td>
            <td>{row.invited == null ? '-' : row.invited.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
