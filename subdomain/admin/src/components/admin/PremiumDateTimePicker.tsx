'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PremiumDateTimePickerProps {
  value: string; // "YYYY-MM-DDTHH:MM" format
  onChange: (value: string) => void;
  className?: string;
}

export default function PremiumDateTimePicker({ value, onChange, className }: PremiumDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial value or default to current date
  const parseValue = (valStr: string) => {
    if (!valStr) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hours: 12,
        minutes: 0,
        ampm: 'PM' as 'AM' | 'PM'
      };
    }
    try {
      const date = new Date(valStr);
      if (isNaN(date.getTime())) throw new Error();
      
      let rawHours = date.getHours();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      let hours = rawHours % 12;
      if (hours === 0) hours = 12;
      
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hours,
        minutes: Math.round(date.getMinutes() / 5) * 5 % 60, // round to nearest 5 mins
        ampm
      };
    } catch {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hours: 12,
        minutes: 0,
        ampm: 'PM' as 'AM' | 'PM'
      };
    }
  };

  const [state, setState] = useState(parseValue(value));

  // Calendar View Month/Year (can be different from selected date)
  const [viewMonth, setViewMonth] = useState(state.month);
  const [viewYear, setViewYear] = useState(state.year);

  // Sync state when value changes externally
  useEffect(() => {
    const parsed = parseValue(value);
    setState(parsed);
    setViewMonth(parsed.month);
    setViewYear(parsed.year);
  }, [value]);

  // Handle outside clicks to close the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  // Helper to format leading zeros
  const pad = (n: number) => String(n).padStart(2, '0');

  const triggerChange = (updatedState: typeof state) => {
    let hr24 = updatedState.hours;
    if (updatedState.ampm === 'PM' && hr24 < 12) hr24 += 12;
    if (updatedState.ampm === 'AM' && hr24 === 12) hr24 = 0;

    const formattedDate = `${updatedState.year}-${pad(updatedState.month + 1)}-${pad(updatedState.day)}T${pad(hr24)}:${pad(updatedState.minutes)}`;
    onChange(formattedDate);
  };

  const handleDateSelect = (day: number) => {
    const updated = { ...state, year: viewYear, month: viewMonth, day };
    setState(updated);
    triggerChange(updated);
  };

  const handleTimeSelect = (key: 'hours' | 'minutes' | 'ampm', val: any) => {
    const updated = { ...state, [key]: val };
    setState(updated);
    triggerChange(updated);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(next => next + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // UI display string
  const getDisplayString = () => {
    if (!value) return 'Schedule for later...';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Schedule for later...';
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      };
      const dateStr = date.toLocaleDateString('en-US', options);
      
      let hr = date.getHours();
      const ampm = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12;
      if (hr === 0) hr = 12;
      
      return `${dateStr} at ${pad(hr)}:${pad(date.getMinutes())} ${ampm}`;
    } catch {
      return 'Schedule for later...';
    }
  };

  // Generate calendar days grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);
  
  // Previous month days to fill start of grid
  const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYearIndex = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYearIndex, prevMonthIndex);
  
  const gridCells = [];
  
  // Fill previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    gridCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      year: prevYearIndex,
      month: prevMonthIndex
    });
  }
  
  // Fill current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push({
      day: i,
      isCurrentMonth: true,
      year: viewYear,
      month: viewMonth
    });
  }
  
  // Fill next month leading days to complete full grid (6 rows * 7 days = 42 cells)
  const remainingCells = 42 - gridCells.length;
  const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYearIndex = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let i = 1; i <= remainingCells; i++) {
    gridCells.push({
      day: i,
      isCurrentMonth: false,
      year: nextYearIndex,
      month: nextMonthIndex
    });
  }

  // Pre-configured options for custom list views
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

  return (
    <div className={cn("relative w-full", className)} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-900 dark:text-zinc-100 px-4 h-11 rounded-xl text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/45"
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-violet-500" />
          <span className={cn(value ? "font-bold text-zinc-800 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500")}>
            {getDisplayString()}
          </span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Popover Picker */}
      {isOpen && (
        <div className="absolute left-0 z-[100] mt-2 p-5 bg-zinc-950/95 dark:bg-black/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-5 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[320px] md:min-w-[480px]">
          
          {/* Calendar Section (Left Side) */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {months[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map(d => (
                <span key={d} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {gridCells.map((cell, idx) => {
                const isSelected = 
                  state.day === cell.day && 
                  state.month === cell.month && 
                  state.year === cell.year;
                
                const isToday = 
                  new Date().getDate() === cell.day && 
                  new Date().getMonth() === cell.month && 
                  new Date().getFullYear() === cell.year;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setViewMonth(cell.month);
                      setViewYear(cell.year);
                      handleDateSelect(cell.day);
                    }}
                    className={cn(
                      "aspect-square w-full rounded-lg text-xs font-bold flex items-center justify-center transition-all relative",
                      cell.isCurrentMonth ? "text-zinc-300 hover:text-white hover:bg-zinc-800" : "text-zinc-600 hover:bg-zinc-900/50",
                      isToday && !isSelected && "border border-zinc-700 text-white",
                      isSelected && "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black scale-105 shadow-md shadow-violet-600/30"
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Section (Right Side) */}
          <div className="w-full md:w-[150px] border-t md:border-t-0 md:border-l border-zinc-800 md:pt-0 md:pl-5 flex flex-col justify-between pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-3">
                <Clock className="w-3.5 h-3.5 text-fuchsia-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Select Time</span>
              </div>

              <div className="grid grid-cols-3 md:flex md:flex-col gap-3">
                {/* Hours Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Hour</label>
                  <select
                    value={state.hours}
                    onChange={e => handleTimeSelect('hours', Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    {hourOptions.map(h => (
                      <option key={h} value={h}>{pad(h)}</option>
                    ))}
                  </select>
                </div>

                {/* Minutes Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Minute</label>
                  <select
                    value={state.minutes}
                    onChange={e => handleTimeSelect('minutes', Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    {minuteOptions.map(m => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                </div>

                {/* AM / PM Selector Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Period</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 flex">
                    {(['AM', 'PM'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTimeSelect('ampm', p)}
                        className={cn(
                          "flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-all uppercase",
                          state.ampm === p
                            ? "bg-zinc-800 text-white font-black shadow-inner"
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Picker Footer Actions */}
            <div className="flex justify-between items-center gap-2 mt-5 md:mt-0 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-bold text-[10px] uppercase tracking-widest py-1 h-7 rounded-lg"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
