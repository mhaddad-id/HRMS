'use client';

import * as React from 'react';
import { format, addMonths, subMonths, getYear, getMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MonthPickerProps {
  value: string; // YYYY-MM
  onValueChangeAction: (value: string) => void;
  className?: string;
}

export function MonthPicker({ value, onValueChangeAction, className }: MonthPickerProps) {
  const date = React.useMemo(() => {
    if (!value) return new Date();
    const [y, m] = value.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, [value]);

  const [viewDate, setViewDate] = React.useState(date);

  // Sync viewDate when value changes externally
  React.useEffect(() => {
    setViewDate(date);
  }, [date]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    const y = newDate.getFullYear();
    const m = (newDate.getMonth() + 1).toString().padStart(2, '0');
    onValueChangeAction(`${y}-${m}`);
  };

  const currentYear = viewDate.getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[180px] justify-start text-left font-bold h-10 rounded-xl border-emerald-300 bg-emerald-300/10 hover:bg-emerald-300/20 hover:border-emerald-300 transition-all shadow-none",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 text-emerald-600" />
          {format(date, "MMMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 rounded-2xl shadow-2xl border-emerald-100" align="start">
        <div className="flex items-center justify-between mb-4 px-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-emerald-50 text-emerald-600"
            onClick={(e) => {
              e.stopPropagation();
              setViewDate(subMonths(viewDate, 12));
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-black uppercase tracking-widest text-emerald-600">
            {currentYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-emerald-500 text-emerald-200"
            onClick={(e) => {
              e.stopPropagation();
              setViewDate(addMonths(viewDate, 12));
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isSelected = getMonth(date) === index && getYear(date) === currentYear;
            const isCurrentMonth = getMonth(new Date()) === index && getYear(new Date()) === currentYear;

            return (
              <Button
                key={month}
                variant="ghost"
                className={cn(
                  "h-10 text-xs font-bold rounded-xl transition-all",
                  isSelected
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : isCurrentMonth
                      ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                      : "hover:bg-emerald-50 hover:text-emerald-600"
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month.toUpperCase()}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
