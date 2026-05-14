"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { IconChevronDown, IconUser, IconX } from "@tabler/icons-react";
import { CustomerAvatar } from "@/components/admin/customers-v2/customer-avatar";
import {
  useGetAllCustomers,
  type Customer,
} from "@/app/api/customers/use-get-all";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

interface CustomerComboboxProps {
  value: string;
  onChange: (customerId: string) => void;
  className?: string;
}

export function CustomerCombobox({
  value,
  onChange,
  className,
}: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { data, isFetching } = useGetAllCustomers(
    1,
    50,
    debouncedSearch || undefined,
  );
  const customers = data?.data || [];

  // Cache the selected customer separately from the live search results so
  // the trigger label keeps showing the right name even after the search
  // input is cleared and the result list refetches.
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(null);

  // Keep local cache in sync with the external value:
  // - If value cleared externally (X button), drop the cache.
  // - If value matches a customer that just appeared in the results
  //   (e.g. on first mount with a preselected id), capture it.
  React.useEffect(() => {
    if (!value) {
      setSelectedCustomer(null);
    } else if (!selectedCustomer || selectedCustomer._id !== value) {
      const found = customers.find((c) => c._id === value);
      if (found) setSelectedCustomer(found);
    }
  }, [value, customers, selectedCustomer]);

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) setSearchInput("");
  }, [open]);

  const labelText = selectedCustomer
    ? `${selectedCustomer.firstName} ${selectedCustomer.lastName ?? ""}`.trim()
    : "All customers";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-10 justify-between gap-2 min-w-[220px] max-w-[280px]",
              value && "border-foreground/30",
            )}
          >
            <span className="flex items-center gap-2 min-w-0 flex-1">
              {selectedCustomer ? (
                <CustomerAvatar
                  firstName={selectedCustomer.firstName}
                  lastName={selectedCustomer.lastName}
                  size="sm"
                />
              ) : (
                <IconUser className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="truncate text-sm font-normal">{labelText}</span>
            </span>
            <IconChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search customer…"
              value={searchInput}
              onValueChange={setSearchInput}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>
                {isFetching ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                    <Spinner className="h-3 w-3" />
                    Searching…
                  </div>
                ) : (
                  "No customer found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {customers.map((c) => {
                  const fullName = `${c.firstName} ${c.lastName ?? ""}`.trim();
                  return (
                    <CommandItem
                      key={c._id}
                      value={`${fullName} ${c.email ?? ""}`}
                      onSelect={() => {
                        setSelectedCustomer(c);
                        onChange(c._id);
                        setOpen(false);
                      }}
                    >
                      <CustomerAvatar
                        firstName={c.firstName}
                        lastName={c.lastName}
                        size="sm"
                      />
                      <div className="ml-2 min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {fullName}
                        </p>
                        {c.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Clear customer filter"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <IconX className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
