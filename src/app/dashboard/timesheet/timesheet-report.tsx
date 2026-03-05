import { formatDate } from '@/lib/utils';

type TimesheetEntry = {
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  regular_hours: number;
  overtime_hours: number;
};

type LeaveEntry = {
  leave_type: 'annual' | 'sick' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  status?: string;
};

export function TimesheetReport({
  month,
  employee,
  timesheets,
  leaves,
}: {
  month: string; // YYYY-MM
  employee: {
    pay_no?: string | null;
    first_name: string;
    last_name: string;
    position?: string | null;
    office?: string | null;
    supervisor?: string | null;
    status?: string | null;
  };
  timesheets: TimesheetEntry[];
  leaves: LeaveEntry[];
}) {
  const [yStr, mStr] = month.split('-');
  const year = Number(yStr);
  const monthIndex = Math.max(0, Math.min(11, Number(mStr) - 1));
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1))) {
    days.push(d);
  }

  const keyOf = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

  const dayLabel = (d: Date) => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getUTCDay()]!;

  const isWeekend = (d: Date) => {
    const dow = d.getUTCDay();
    return dow === 5 || dow === 6; // Fri/Sat like screenshot
  };

  const toHHMM = (value: string | null) => {
    if (!value) return '00:00';
    const dt = new Date(value);
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const hoursToHHMM = (hours: number) => {
    const total = Math.round(hours * 60);
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const timesheetByDate = new Map<string, TimesheetEntry>();
  timesheets.forEach((t) => timesheetByDate.set(String(t.work_date).slice(0, 10), t));

  const leaveTypeByDate = new Map<string, LeaveEntry['leave_type']>();
  const overlaps = (d: Date, l: LeaveEntry) => {
    const k = keyOf(d);
    return k >= String(l.start_date).slice(0, 10) && k <= String(l.end_date).slice(0, 10);
  };
  days.forEach((d) => {
    const match = leaves.find((l) => overlaps(d, l) && (!l.status || l.status === 'approved'));
    if (match) leaveTypeByDate.set(keyOf(d), match.leave_type);
  });

  const sumWorkedMinutes = days.reduce((acc, d) => {
    const t = timesheetByDate.get(keyOf(d));
    if (!t) return acc;
    const mins = Math.round((Number(t.regular_hours) + Number(t.overtime_hours)) * 60);
    return acc + mins;
  }, 0);

  const totalWorked = `${String(Math.floor(sumWorkedMinutes / 60)).padStart(2, '0')}:${String(sumWorkedMinutes % 60).padStart(2, '0')}`;

  const leaveRows: Array<{ key: LeaveEntry['leave_type'] | 'absence' | 'public_holiday'; label: string }> =
    [
      { key: 'annual', label: 'Annual-Leave' },
      { key: 'sick', label: 'Sick-Leave' },
      { key: 'other', label: 'Other-Leave' },
      { key: 'public_holiday', label: 'Public-Holiday' },
      { key: 'unpaid', label: 'Unpaid-Leave' },
      { key: 'absence', label: 'Absence' },
    ];

  const cellClass = (d: Date) =>
    `border border-border/80 px-2 py-2 text-center text-[11px] leading-none ${isWeekend(d) ? 'bg-yellow-200/70' : 'bg-background'}`;

  const headerCellClass = (d: Date) =>
    `border border-border/80 px-2 py-2 text-center text-[11px] font-semibold ${isWeekend(d) ? 'bg-yellow-200/70' : 'bg-muted/60'}`;

  return (
    <div className="print-area">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          .print-area {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="rounded-md border bg-card overflow-x-auto">
        <div className="min-w-[1200px] p-3">
          <div className="grid grid-cols-3 gap-2 border border-border/80">
            <div className="p-3 border-r border-border/80">
              <div className="text-xs font-semibold">Pay No: {employee.pay_no ?? '—'}</div>
            </div>
            <div className="p-3 border-r border-border/80 text-center">
              <div className="text-sm font-bold">TIMESHEET</div>
              <div className="text-xs text-muted-foreground">{formatDate(start)}</div>
            </div>
            <div className="p-3 text-right">
              <div className="text-xs font-semibold">{employee.status ?? '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-12 border-x border-b border-border/80">
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">Name</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">
              {employee.first_name} {employee.last_name}
            </div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Position
            </div>
            <div className="col-span-4 p-2 text-xs">{employee.position ?? '—'}</div>

            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">Month</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">
              {formatDate(start, { month: 'short', year: 'numeric' })}
            </div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Location
            </div>
            <div className="col-span-4 p-2 text-xs">{employee.office ?? '—'}</div>

            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">BEG</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">{formatDate(start)}</div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Supervisor&apos;s Name
            </div>
            <div className="col-span-4 p-2 text-xs">{employee.supervisor ?? '—'}</div>

            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">END</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">{formatDate(end)}</div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Employee&apos;s Signature
            </div>
            <div className="col-span-4 p-2 text-xs">&nbsp;</div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border/80 bg-muted/60 px-2 py-2 text-left text-xs font-semibold" colSpan={2}>
                    Days
                  </th>
                  {days.map((d) => (
                    <th key={keyOf(d)} className={headerCellClass(d)}>
                      {dayLabel(d)}
                    </th>
                  ))}
                  <th className="border border-border/80 bg-muted/60 px-2 py-2 text-center text-xs font-semibold">
                    Total
                  </th>
                </tr>
                <tr>
                  <th className="border border-border/80 bg-muted/60 px-2 py-2 text-left text-xs font-semibold" colSpan={2}>
                    Date
                  </th>
                  {days.map((d) => (
                    <th key={keyOf(d)} className={headerCellClass(d)}>
                      {String(d.getUTCDate()).padStart(2, '0')}
                    </th>
                  ))}
                  <th className="border border-border/80 bg-muted/60 px-2 py-2 text-center text-xs font-semibold">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold w-[140px]" rowSpan={3}>
                    Time
                  </td>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold w-[120px]">
                    Time-in
                  </td>
                  {days.map((d) => {
                    const t = timesheetByDate.get(keyOf(d));
                    return (
                      <td key={keyOf(d)} className={cellClass(d)}>
                        {toHHMM(t?.clock_in ?? null)}
                      </td>
                    );
                  })}
                  <td className="border border-border/80 px-2 py-2 text-center text-[11px]">—</td>
                </tr>
                <tr>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold">Time-out</td>
                  {days.map((d) => {
                    const t = timesheetByDate.get(keyOf(d));
                    return (
                      <td key={keyOf(d)} className={cellClass(d)}>
                        {toHHMM(t?.clock_out ?? null)}
                      </td>
                    );
                  })}
                  <td className="border border-border/80 px-2 py-2 text-center text-[11px]">—</td>
                </tr>
                <tr>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold">
                    Worked-Hours
                  </td>
                  {days.map((d) => {
                    const t = timesheetByDate.get(keyOf(d));
                    const hrs = t ? Number(t.regular_hours) + Number(t.overtime_hours) : 0;
                    return (
                      <td key={keyOf(d)} className={cellClass(d)}>
                        {hoursToHHMM(hrs)}
                      </td>
                    );
                  })}
                  <td className="border border-border/80 px-2 py-2 text-center text-[11px] font-semibold">
                    {totalWorked}
                  </td>
                </tr>

                <tr>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold" rowSpan={leaveRows.length}>
                    Leave
                  </td>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold">
                    {leaveRows[0]!.label}
                  </td>
                  {days.map((d) => {
                    const k = keyOf(d);
                    const typ = leaveTypeByDate.get(k);
                    const show = typ === leaveRows[0]!.key ? '08:00' : '';
                    return (
                      <td key={k} className={cellClass(d)}>
                        {show}
                      </td>
                    );
                  })}
                  <td className="border border-border/80 px-2 py-2 text-center text-[11px]">—</td>
                </tr>

                {leaveRows.slice(1).map((row) => (
                  <tr key={row.key}>
                    <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold">
                      {row.label}
                    </td>
                    {days.map((d) => {
                      const k = keyOf(d);
                      const typ = leaveTypeByDate.get(k);
                      const show = typ === row.key ? '08:00' : '';
                      return (
                        <td key={k} className={cellClass(d)}>
                          {show}
                        </td>
                      );
                    })}
                    <td className="border border-border/80 px-2 py-2 text-center text-[11px]">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 grid grid-cols-12 border border-border/80">
            <div className="col-span-4 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Hours Allocation
            </div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Notes
            </div>
            <div className="col-span-4 p-2 text-xs font-semibold bg-muted/50">
              Human Resources Department / Checked and Verified By:
            </div>
            <div className="col-span-4 border-r border-border/80 p-6 text-xs">&nbsp;</div>
            <div className="col-span-4 border-r border-border/80 p-6 text-xs">&nbsp;</div>
            <div className="col-span-4 p-6 text-xs">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  );
}

