'use client';

import { formatDate } from '@/lib/utils';

interface ReviewRow {
  id: string;
  review_period_start: string;
  review_period_end: string;
  score: number;
  notes: string | null;
  employee?: { first_name: string; last_name: string } | null;
}

export function PerformanceTable({ reviews }: { reviews: ReviewRow[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Employee</th>
            <th className="px-4 py-3 text-left font-medium">Period</th>
            <th className="px-4 py-3 text-left font-medium">Score</th>
            <th className="px-4 py-3 text-left font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
              </td>
              <td className="px-4 py-3">
                {formatDate(r.review_period_start)} – {formatDate(r.review_period_end)}
              </td>
              <td className="px-4 py-3">{r.score}/5</td>
              <td className="px-4 py-3 max-w-xs truncate">{r.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {reviews.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No performance reviews yet.</div>
      )}
    </div>
  );
}
