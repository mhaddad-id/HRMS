"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  onDateChangeAction: (date?: Date) => void
  placeholder?: string
  /** Earliest year in the year dropdown */
  fromYear?: number
  /** Latest year in the year dropdown */
  toYear?: number
  /** Calendar month shown when no date is selected yet */
  defaultCalendarMonth?: Date
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
}

function buildMonthRange(fromYear: number, toYear: number) {
  const now = new Date()
  return {
    startMonth: new Date(fromYear, 0, 1),
    endMonth: new Date(toYear, 11, 31),
    defaultMonth: now.getFullYear() >= fromYear && now.getFullYear() <= toYear
      ? now
      : new Date(toYear, now.getMonth(), 1),
  }
}

export function DatePicker({
  date,
  onDateChangeAction,
  placeholder = "Pick a date",
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear() + 5,
  defaultCalendarMonth,
  captionLayout = "dropdown",
}: DatePickerProps) {
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(() => date ?? defaultCalendarMonth ?? new Date())

  const { startMonth, endMonth, defaultMonth } = React.useMemo(
    () => buildMonthRange(fromYear, toYear),
    [fromYear, toYear]
  )

  React.useEffect(() => {
    setTempDate(date)
  }, [date])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setTempDate(date)
      setMonth(date ?? defaultCalendarMonth ?? defaultMonth)
    }
  }

  const handleSave = () => {
    onDateChangeAction(tempDate)
    setOpen(false)
  }

  const usesDropdown =
    captionLayout === "dropdown" ||
    captionLayout === "dropdown-months" ||
    captionLayout === "dropdown-years"

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 rounded-xl border-emerald-200 bg-background px-3 shadow-none transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl border shadow-xl overflow-hidden" align="start">
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={setTempDate}
          month={month}
          onMonthChange={setMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          captionLayout={captionLayout}
          hideNavigation={usesDropdown}
          reverseYears
          initialFocus
          className="p-3"
        />
        <div className="p-3 border-t border-muted bg-muted/20 flex justify-end">
          <Button
            size="sm"
            className="rounded-xl h-8 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-100 dark:shadow-none"
            onClick={handleSave}
            disabled={!tempDate}
          >
            Save Date
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
