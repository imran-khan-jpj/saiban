"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  value?: string; // Format: "MM/yyyy"
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select month/year",
  className,
  disabled,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState<string>("");

  // Parse value when it changes
  React.useEffect(() => {
    if (value) {
      const [month, year] = value.split("/");
      setSelectedMonth(month || "");
      setSelectedYear(year || "");
    } else {
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [value]);

  // Generate years from current year - 20 to current year + 10
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - 20 + i);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedYear) {
      onChange?.(`${month}/${selectedYear}`);
      setIsOpen(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedMonth) {
      onChange?.(`${selectedMonth}/${year}`);
      setIsOpen(false);
    }
  };

  const displayValue = value
    ? (() => {
        const [month, year] = value.split("/");
        return `${month}/${year}`;
      })()
    : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className={cn(
            "data-[empty=true]:text-muted-foreground justify-between text-left font-normal",
            className,
          )}
          disabled={disabled}
        >
          {displayValue || <span>{placeholder}</span>}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
