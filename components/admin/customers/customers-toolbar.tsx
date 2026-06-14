"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX, IconArrowsSort } from "@tabler/icons-react";
import type { CustomersListSort } from "@/app/api/customers/use-get-all";

interface CustomersToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  sort: CustomersListSort;
  onSortChange: (value: CustomersListSort) => void;
}

export function CustomersToolbar({
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
}: CustomersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-sm flex-1 min-w-[240px]">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name…"
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

      <div className="flex items-center gap-1.5 rounded-lg border bg-card pl-3 pr-1 h-10">
        <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground" />
        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as CustomersListSort)}
        >
          <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 px-2 h-8 w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="recent">Recently added</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
