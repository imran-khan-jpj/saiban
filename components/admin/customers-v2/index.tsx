"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPlus, IconPhone, IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import {
  useGetAllCustomers,
  Customer,
  type CustomersListSort,
} from "@/app/api/customers/use-get-all";
import { useCreateCustomer } from "@/app/api/customers/use-create";
import { useUpdateCustomer } from "@/app/api/customers/use-update";
import { useDeleteCustomer } from "@/app/api/customers/use-delete";
import { formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { CustomersToolbar } from "./customers-toolbar";
import { CustomerAvatar } from "./customer-avatar";
import { CustomerRowActions } from "./customer-row-actions";
import { CustomerFormV2, type CustomerFormPayload } from "./customer-form-v2";

export function CustomersV2() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState("");
  const [sort, setSort] = React.useState<CustomersListSort>("name");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, sort]);

  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null,
  );
  const [deletingCustomerId, setDeletingCustomerId] = React.useState<
    string | null
  >(null);

  const { data, isLoading, isFetching, isError, error } = useGetAllCustomers(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
    sort,
  );

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const customers = React.useMemo(
    () =>
      (data?.data || []).map((c) => ({
        ...c,
        id: c._id,
      })),
    [data],
  );

  const handleView = React.useCallback(
    (customerId: string) => {
      router.push(`/admin/v2/customers/${customerId}`);
    },
    [router],
  );

  const handleEdit = React.useCallback(
    (customer: Customer & { id: string }) => {
      setEditingCustomer(customer);
      setIsFormDialogOpen(true);
    },
    [],
  );

  const handleDelete = React.useCallback((id: string) => {
    setDeletingCustomerId(id);
  }, []);

  const columns = React.useMemo<ColumnDef<Customer & { id: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        size: 320,
        cell: ({ row }) => {
          const c = row.original;
          const fullName = `${c.firstName} ${c.lastName ?? ""}`.trim();
          return (
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <CustomerAvatar firstName={c.firstName} lastName={c.lastName} />
              <div className="min-w-0 flex-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleView(c._id)}
                        className="block w-full text-left truncate text-sm font-semibold text-foreground hover:underline underline-offset-4"
                      >
                        {fullName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[320px]">
                      {fullName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {c.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.email}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        size: 170,
        cell: ({ row }) => {
          const phone = row.original.phoneNumber;
          if (!phone) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 text-sm tabular-nums text-foreground hover:underline underline-offset-4"
              onClick={(e) => e.stopPropagation()}
            >
              <IconPhone className="h-3 w-3 text-muted-foreground" />
              {phone}
            </a>
          );
        },
      },
      {
        accessorKey: "address",
        header: "Address",
        size: 280,
        cell: ({ row }) => {
          const c = row.original;
          const address = [c.streetAddress, c.city, c.state]
            .filter(Boolean)
            .join(", ")
            .trim();
          if (!address) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconMapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-muted-foreground">
                      {address}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  {address}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Added",
        size: 130,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <CustomerRowActions
              onView={() => handleView(row.original._id)}
              onEdit={() => handleEdit(row.original)}
              onDelete={() => handleDelete(row.original._id)}
            />
          </div>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete],
  );

  const handleAddCustomer = (payload: CustomerFormPayload) => {
    createCustomer.mutate(payload, {
      onSuccess: () => {
        toast.success("Customer created");
        setIsFormDialogOpen(false);
      },
      onError: (err) => {
        toast.error(`Failed to create customer: ${err.message}`);
      },
    });
  };

  const handleUpdateCustomer = (payload: CustomerFormPayload) => {
    if (!editingCustomer) return;
    updateCustomer.mutate(
      { customerId: editingCustomer._id, data: payload },
      {
        onSuccess: () => {
          toast.success("Customer updated");
          setIsFormDialogOpen(false);
          setEditingCustomer(null);
        },
        onError: (err) => {
          toast.error(`Failed to update customer: ${err.message}`);
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomerId) return;
    deleteCustomer.mutate(deletingCustomerId, {
      onSuccess: () => {
        toast.success("Customer deleted");
        setDeletingCustomerId(null);
      },
      onError: (err) => {
        toast.error(`Failed to delete customer: ${err.message}`);
        setDeletingCustomerId(null);
      },
    });
  };

  const totalCount = data?.pagination.total ?? 0;
  const showingFrom =
    customers.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const showingTo = pagination.pageIndex * pagination.pageSize + customers.length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Directory</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
            {totalCount}{" "}
            {totalCount === 1 ? "customer" : "customers"} in your address book.
          </p>
        </div>
        <Dialog
          open={isFormDialogOpen}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) setEditingCustomer(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(null)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit customer" : "Add new customer"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? "Update the customer's information below."
                  : "Fill in the details to add a new customer."}
              </DialogDescription>
            </DialogHeader>
            <CustomerFormV2
              customer={editingCustomer}
              onSubmit={
                editingCustomer ? handleUpdateCustomer : handleAddCustomer
              }
              onCancel={() => {
                setIsFormDialogOpen(false);
                setEditingCustomer(null);
              }}
              isSubmitting={
                createCustomer.isPending || updateCustomer.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </header>

      <CustomersToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Table card */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount === 0
              ? "No customers"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {isError ? (
            <div className="flex h-64 items-center justify-center px-5">
              <p className="text-sm text-destructive">
                Error loading customers: {error?.message || "Unknown error"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No customers match your search
              </p>
              <p className="text-xs text-muted-foreground">
                Try clearing the search or adjusting filters.
              </p>
            </div>
          ) : (
            <DataTable
              data={customers}
              columns={columns}
              enableRowSelection={false}
              manualPagination={true}
              pageCount={data?.pagination.pages}
              pagination={pagination}
              onPaginationChange={setPagination}
              isFetching={isFetching}
            />
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingCustomerId}
        onOpenChange={(open) => !open && setDeletingCustomerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The customer and their related data
              will be removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/70"
            >
              {deleteCustomer.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
