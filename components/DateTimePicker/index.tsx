"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Timestamp } from 'firebase/firestore'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateTimePickerProps {
  onDateTimeChange: (timestamp: Timestamp) => void
  initialTimestamp?: Timestamp | Date | number | { seconds: number; nanoseconds: number }
}

export default function DateTimePicker({ onDateTimeChange, initialTimestamp }: DateTimePickerProps) {
  const getInitialDate = (): Date | undefined => {
    if (!initialTimestamp) return undefined
    if (initialTimestamp instanceof Timestamp) return initialTimestamp.toDate()
    if (initialTimestamp instanceof Date) return initialTimestamp
    if (typeof initialTimestamp === 'number') return new Date(initialTimestamp)
    if (typeof initialTimestamp === 'object' && 'seconds' in initialTimestamp) {
      return new Date(initialTimestamp.seconds * 1000)
    }
    return undefined
  }

  const initialDate = getInitialDate()
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [time, setTime] = useState<string>(
    initialDate ? format(initialDate, "HH:mm") : "00:00"
  )

  const lastTimestampRef = useRef<Timestamp | null>(null)

  const updateTimestamp = useCallback(() => {
    if (date) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)  // Set seconds and milliseconds to 0
      const newTimestamp = Timestamp.fromDate(newDate)

      // Only update if the timestamp has changed
      if (!lastTimestampRef.current || !newTimestamp.isEqual(lastTimestampRef.current)) {
        lastTimestampRef.current = newTimestamp
        onDateTimeChange(newTimestamp)
      }
    }
  }, [date, time, onDateTimeChange])

  useEffect(() => {
    updateTimestamp()
  }, [updateTimestamp])

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && !date) {
      const now = new Date()
      setTime(format(now, "HH:mm"))
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (!date) {
      setDate(new Date())
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[120px] justify-start text-left font-normal",
              !time && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time || "Pick a time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="flex p-2">
            <Select
              onValueChange={(value) => handleTimeChange(`${value}:${time.split(":")[1]}`)}
              value={time.split(":")[0]}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="mx-2 text-2xl">:</span>
            <Select
              onValueChange={(value) => handleTimeChange(`${time.split(":")[0]}:${value}`)}
              value={time.split(":")[1]}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}