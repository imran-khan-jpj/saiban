"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerForm } from "./customer-form";
import { useGetAllCustomers, Customer } from "@/app/api/customers/use-get-all";
import { useCreateCustomer } from "@/app/api/customers/use-create";
import { useUpdateCustomer } from "@/app/api/customers/use-update";
import { useDeleteCustomer } from "@/app/api/customers/use-delete";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Re-export Customer type
export type { Customer };

export function Customers() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null,
  );
  const [deletingCustomerId, setDeletingCustomerId] = React.useState<
    string | null
  >(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch customers from API with pagination
  const { data, isLoading, isError, error } = useGetAllCustomers(
    pagination.pageIndex + 1, // API uses 1-based page numbering
    pagination.pageSize,
  );

  // Mutations
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Transform data for DataTable (add id field)
  const customers = React.useMemo(() => {
    return (data?.data || []).map((customer) => ({
      ...customer,
      id: customer._id, // Add id field for DataTable
    }));
  }, [data]);

  // Column definitions
  const columns: ColumnDef<Customer & { id: string }>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      size: 200,
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/customers/${row.original._id}`)}
          className="font-medium text-blue-600 hover:text-blue-700 underline text-left cursor-pointer"
        >
          {row.original.firstName} {row.original.lastName}
        </button>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phoneNumber}`}
          className="hover:text-primary underline-offset-4 hover:underline"
        >
          {row.original.phoneNumber}
        </a>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.streetAddress}, {row.original.city}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <IconPencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(row.original._id)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleAddCustomer = (
    data: Omit<Customer, "_id" | "createdAt" | "updatedAt">,
  ) => {
    createCustomer.mutate(data, {
      onSuccess: () => {
        toast.success("Customer created successfully");
        setIsAddDialogOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to create customer: ${error.message}`);
      },
    });
  };

  const handleEdit = (customer: Customer & { id: string }) => {
    setEditingCustomer(customer);
    setIsAddDialogOpen(true);
  };

  const handleUpdateCustomer = (
    data: Omit<Customer, "_id" | "createdAt" | "updatedAt">,
  ) => {
    if (!editingCustomer) return;

    updateCustomer.mutate(
      { customerId: editingCustomer._id, data },
      {
        onSuccess: () => {
          toast.success("Customer updated successfully");
          setIsAddDialogOpen(false);
          setEditingCustomer(null);
        },
        onError: (error) => {
          toast.error(`Failed to update customer: ${error.message}`);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    setDeletingCustomerId(id);
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomerId) return;

    deleteCustomer.mutate(deletingCustomerId, {
      onSuccess: () => {
        toast.success("Customer deleted successfully");
        setDeletingCustomerId(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete customer: ${error.message}`);
        setDeletingCustomerId(null);
      },
    });
  };

  const handleCancelDelete = () => {
    setDeletingCustomerId(null);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingCustomer(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-destructive">
          Error loading customers: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-center justify-between mt-2">
        <div>
          <p className="text-muted-foreground">
            Manage your customers and view their details (
            {data?.pagination.total || 0} total)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? "Update customer information below."
                  : "Fill in the details to add a new customer."}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={
                editingCustomer ? handleUpdateCustomer : handleAddCustomer
              }
              onCancel={handleDialogClose}
              isSubmitting={
                createCustomer.isPending || updateCustomer.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          data={customers}
          columns={columns}
          enableRowSelection={false}
          manualPagination={true}
          pageCount={data?.pagination.pages}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCustomerId}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/70"
            >
              {deleteCustomer.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
