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
}

export function DatePicker({ date, onDateChangeAction, placeholder = "Pick a date" }: DatePickerProps) {
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)
  const [open, setOpen] = React.useState(false)

  // Update tempDate when external source 'date' prop changes
  React.useEffect(() => {
    setTempDate(date)
  }, [date])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setTempDate(date)
    }
  }

  const handleSave = () => {
    onDateChangeAction(tempDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 rounded-xl bg-background border-muted px-3 focus:ring-emerald-500",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
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
