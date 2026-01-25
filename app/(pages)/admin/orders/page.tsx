"use client";

import * as React from "react";
import { Orders } from "@/components/admin/orders";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";

export default function OrdersPage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  return (
    <div className="flex flex-col h-full p-4">
      <SiteHeader title="Orders">
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Orders
          searchInput={searchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
    </div>
  );
}
