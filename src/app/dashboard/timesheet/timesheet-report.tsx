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
    employee_code?: string | null;
    first_name: string;
    last_name: string;
    position?: string | null;
    office?: string | null;
    supervisor?: string | null;
    status?: string | null;
    ending_date?: string | null;
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
    return dow === 6 || dow === 0; // Sa/Su
  };

  const toHHMM = (value: string | null) => {
    if (!value) return '00:00';
    const dt = new Date(value);
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const isAfterEndingDate = (d: Date) => {
    if (!employee.ending_date) return false;
    const endDt = new Date(employee.ending_date);
    // Compare dates only
    const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const endDay = new Date(Date.UTC(endDt.getUTCFullYear(), endDt.getUTCMonth(), endDt.getUTCDate()));
    return day > endDay;
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
    if (isAfterEndingDate(d)) return acc;
    const k = keyOf(d);
    const t = timesheetByDate.get(k);
    const hasLeave = leaveTypeByDate.has(k);
    const weekend = isWeekend(d);

    let hrs = 0;
    if (t) {
      hrs = Number(t.regular_hours) + Number(t.overtime_hours);
    } else if (!weekend && !hasLeave) {
      // Default to 8 hours for workdays with no logs and no leave
      hrs = 8;
    }

    return acc + Math.round(hrs * 60);
  }, 0);

  const totalWorked = `${String(Math.floor(sumWorkedMinutes / 60)).padStart(2, '0')}:${String(sumWorkedMinutes % 60).padStart(2, '0')}`;

  const leaveRows: Array<{ key: LeaveEntry['leave_type'] | 'public_holiday'; label: string }> =
    [
      { key: 'annual', label: 'Annual-Leave' },
      { key: 'sick', label: 'Sick-Leave' },
      { key: 'other', label: 'Other-Leave' },
      { key: 'public_holiday', label: 'Public-Holiday' },
      { key: 'unpaid', label: 'Unpaid-Leave' },
    ];

  const cellClass = (d: Date) => {
    const gray = isAfterEndingDate(d);
    const weekend = isWeekend(d);
    return `border border-border/80 px-2 py-2 text-center text-[11px] leading-none ${gray ? 'bg-zinc-200 text-zinc-400' : weekend ? 'bg-yellow-200/70' : 'bg-background'}`;
  };

  const headerCellClass = (d: Date) => {
    const gray = isAfterEndingDate(d);
    const weekend = isWeekend(d);
    return `border border-border/80 px-2 py-2 text-center text-[11px] font-semibold ${gray ? 'bg-zinc-200 text-zinc-400' : weekend ? 'bg-yellow-200/70' : 'bg-muted/60'}`;
  };

  return (
    <div className="print-area">
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          /* Show print area and its children */
          .print-area, .print-area * {
            visibility: visible;
          }
          /* Reset positioning for print area */
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          /* Specific overrides to hide common UI elements the visibility trick might miss or leave gaps for */
          header, nav, aside, .print-hidden, button, [data-sidebar] {
            display: none !important;
          }
          /* Overwrite the min-width for the print version to prevent horizontal clipping */
          .print-container {
            min-width: 1050px !important;
            width: 100% !important;
          }
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
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="rounded-md border bg-card overflow-x-auto print:border-none">
        <div className="min-w-[1200px] p-3 print-container">
          <div className="grid grid-cols-3 gap-2 border border-border/80">
            <div className="p-3 border-r border-border/80">
              <div className="text-xs font-semibold">Code: {employee.employee_code ?? '—'}</div>
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

            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">BEG</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">{formatDate(start)}</div>



            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Location
            </div>
            <div className="col-span-4 p-2 text-xs">{employee.office ?? '—'}</div>

            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">END</div>
            <div className="col-span-4 border-r border-border/80 p-2 text-xs">{formatDate(end)}</div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Supervisor&apos;s Name
            </div>
            <div className="col-span-4 p-2 text-xs">{employee.supervisor ?? '—'}</div>


            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Employee&apos;s Signature
            </div>
            <div className="col-span-4 p-2 text-xs">&nbsp;</div>
            <div className="col-span-2 border-r border-border/80 p-2 text-xs font-semibold bg-muted/50">
              Supervisor&apos;s Signature
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
                    const isEnded = isAfterEndingDate(d);
                    return (
                      <td key={keyOf(d)} className={cellClass(d)}>
                        {isEnded ? '—' : toHHMM(t?.clock_in ?? null)}
                      </td>
                    );
                  })}
                  <td className="border border-border/80 px-2 py-2 text-center text-[11px]">—</td>
                </tr>
                <tr>
                  <td className="border border-border/80 bg-muted/50 px-2 py-2 text-xs font-semibold">Time-out</td>
                  {days.map((d) => {
                    const t = timesheetByDate.get(keyOf(d));
                    const isEnded = isAfterEndingDate(d);
                    return (
                      <td key={keyOf(d)} className={cellClass(d)}>
                        {isEnded ? '—' : toHHMM(t?.clock_out ?? null)}
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
                    const k = keyOf(d);
                    const t = timesheetByDate.get(k);
                    const isEnded = isAfterEndingDate(d);
                    const hasLeave = leaveTypeByDate.has(k);
                    const weekend = isWeekend(d);

                    let hrs = 0;
                    if (t && !isEnded) {
                      hrs = Number(t.regular_hours) + Number(t.overtime_hours);
                    } else if (!isEnded && !weekend && !hasLeave) {
                      hrs = 8;
                    }

                    return (
                      <td key={k} className={cellClass(d)}>
                        {isEnded ? '—' : hrs > 0 ? hoursToHHMM(hrs) : ''}
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
                    const isEnded = isAfterEndingDate(d);
                    const show = !isEnded && typ === leaveRows[0]!.key ? '08:00' : isEnded ? '—' : '';
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
                      const isEnded = isAfterEndingDate(d);
                      const show = !isEnded && typ === row.key ? '08:00' : isEnded ? '—' : '';
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
            <div className="col-span-8 border-r border-border/80">
              <div className="p-2 text-xs font-semibold bg-muted/50">
                Notes
              </div>
              <div className="p-6 text-xs min-h-[120px]">
                &nbsp;
              </div>
            </div>

            <div className="col-span-4">
              <div className="p-2 text-xs font-semibold bg-muted/50">
                Human Resources Department / Checked and Verified By:
              </div>
              <div className="p-6 text-xs min-h-[120px]">
                &nbsp;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

