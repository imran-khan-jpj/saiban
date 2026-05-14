"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX, IconFilter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ProductsToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
}

export function ProductsToolbar({
  searchInput,
  onSearchChange,
  stockStatus,
  onStockStatusChange,
}: ProductsToolbarProps) {
  const hasActiveFilters = !!stockStatus || !!searchInput;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-sm flex-1 min-w-[240px]">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9 h-10"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-1.5 rounded-lg border bg-card pl-3 pr-1 h-10",
          stockStatus && "border-foreground/30",
        )}
      >
        <IconFilter className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={stockStatus} onValueChange={onStockStatusChange}>
          <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 px-2 h-8 w-[150px]">
            <SelectValue placeholder="All stock statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>
        {stockStatus && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStockStatusChange("")}
            aria-label="Clear filter"
            className="h-8 w-8 text-muted-foreground"
          >
            <IconX className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange("");
            onStockStatusChange("");
          }}
          className="h-9 text-muted-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
