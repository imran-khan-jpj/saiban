"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { CustomerCombobox } from "./customer-combobox";

interface LedgersToolbarProps {
  customerId: string;
  onCustomerIdChange: (id: string) => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function LedgersToolbar({
  customerId,
  onCustomerIdChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: LedgersToolbarProps) {
  const hasFilters = !!customerId || !!startDate || !!endDate;

  const clearAll = () => {
    onCustomerIdChange("");
    onStartDateChange(undefined);
    onEndDateChange(undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CustomerCombobox value={customerId} onChange={onCustomerIdChange} />

      <div className="flex items-center gap-2">
        <Label
          htmlFor="ledgers-start-date"
          className="text-xs font-medium text-muted-foreground"
        >
          From
        </Label>
        <DatePicker
          date={startDate}
          onDateChange={onStartDateChange}
          placeholder="Pick start date"
          className="h-10 w-[170px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label
          htmlFor="ledgers-end-date"
          className="text-xs font-medium text-muted-foreground"
        >
          To
        </Label>
        <DatePicker
          date={endDate}
          onDateChange={onEndDateChange}
          placeholder="Pick end date"
          className="h-10 w-[170px]"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9 text-muted-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
