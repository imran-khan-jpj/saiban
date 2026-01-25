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
    <div className="flex flex-col h-full">
      <SiteHeader title="Orders" />
      <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
        <Orders
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
    </div>
  );
}
