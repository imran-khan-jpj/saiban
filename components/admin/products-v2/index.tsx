"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import {
  useGetAllProducts,
  Product,
} from "@/app/api/products/use-get-all";
import { useGetProductById } from "@/app/api/products/use-get-by-id";
import { useCreateProduct } from "@/app/api/products/use-create";
import { useUpdateProduct } from "@/app/api/products/use-update";
import { useDeleteProduct } from "@/app/api/products/use-delete";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { ProductStats } from "./product-stats";
import { ProductsToolbar } from "./products-toolbar";
import { StockIndicator } from "./stock-indicator";
import { ProductRowActions } from "./product-row-actions";
import { ProductFormV2 } from "./product-form-v2";
import { ProductDetailsDialog } from "./product-details-dialog";

export function ProductsV2() {
  const [searchInput, setSearchInput] = React.useState("");
  const [stockStatus, setStockStatus] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebouncedValue(searchInput, 400);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, stockStatus]);

  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null,
  );
  const [viewingProductId, setViewingProductId] = React.useState<string | null>(
    null,
  );
  const [deletingProductId, setDeletingProductId] = React.useState<
    string | null
  >(null);

  const { data, isLoading, isFetching, isError, error } = useGetAllProducts(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
    stockStatus || undefined,
  );

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const {
    data: viewingProductData,
    isLoading: isLoadingProduct,
    isError: isProductError,
  } = useGetProductById(viewingProductId);

  const products = React.useMemo(
    () =>
      (data?.data || []).map((product) => ({
        ...product,
        id: product._id,
      })),
    [data],
  );

  const handleEdit = React.useCallback((product: Product & { id: string }) => {
    setEditingProduct(product);
    setIsFormDialogOpen(true);
  }, []);

  const handleView = React.useCallback((productId: string) => {
    setViewingProductId(productId);
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setDeletingProductId(id);
  }, []);

  const columns = React.useMemo<ColumnDef<Product & { id: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        size: 320,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {row.original.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums">
              {row.original.size} {row.original.packType}
              {row.original.batchNo ? ` · Batch ${row.original.batchNo}` : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "formulation",
        header: "Formulation",
        size: 130,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="capitalize font-normal text-xs"
          >
            {row.original.formulation}
          </Badge>
        ),
      },
      {
        accessorKey: "quantityInStock",
        header: "Stock",
        size: 200,
        cell: ({ row }) => (
          <StockIndicator
            quantity={row.original.quantityInStock}
            threshold={row.original.lowStockThreshold}
          />
        ),
      },
      {
        accessorKey: "unitPrice",
        header: () => <div className="text-right">Unit price</div>,
        size: 130,
        cell: ({ row }) => (
          <div className="text-right text-sm font-semibold tabular-nums tracking-tight">
            {formatCurrency(row.original.unitPrice)}
          </div>
        ),
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
            <ProductRowActions
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

  const handleAddProduct = (
    payload: Omit<Product, "_id" | "createdAt" | "updatedAt" | "__v">,
  ) => {
    createProduct.mutate(payload, {
      onSuccess: () => {
        toast.success("Product created");
        setIsFormDialogOpen(false);
      },
      onError: (err) => {
        toast.error(`Failed to create product: ${err.message}`);
      },
    });
  };

  const handleUpdateProduct = (
    payload: Omit<Product, "_id" | "createdAt" | "updatedAt" | "__v">,
  ) => {
    if (!editingProduct) return;
    updateProduct.mutate(
      { productId: editingProduct._id, data: payload },
      {
        onSuccess: () => {
          toast.success("Product updated");
          setIsFormDialogOpen(false);
          setEditingProduct(null);
        },
        onError: (err) => {
          toast.error(`Failed to update product: ${err.message}`);
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingProductId) return;
    deleteProduct.mutate(deletingProductId, {
      onSuccess: () => {
        toast.success("Product deleted");
        setDeletingProductId(null);
      },
      onError: (err) => {
        toast.error(`Failed to delete product: ${err.message}`);
        setDeletingProductId(null);
      },
    });
  };

  const totalCount = data?.pagination.total ?? 0;
  const showingFrom =
    products.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const showingTo = pagination.pageIndex * pagination.pageSize + products.length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Catalog</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage stock levels, pricing, and product details.
          </p>
        </div>
        <Dialog
          open={isFormDialogOpen}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) setEditingProduct(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit product" : "Add new product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update product information below."
                  : "Fill in the details to add a new product."}
              </DialogDescription>
            </DialogHeader>
            <ProductFormV2
              product={editingProduct}
              onSubmit={
                editingProduct ? handleUpdateProduct : handleAddProduct
              }
              onCancel={() => {
                setIsFormDialogOpen(false);
                setEditingProduct(null);
              }}
              isSubmitting={
                createProduct.isPending || updateProduct.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </header>

      <ProductStats />

      {/* Toolbar */}
      <ProductsToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
      />

      {/* Table card */}
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount === 0
              ? "No products"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {isError ? (
            <div className="flex h-64 items-center justify-center px-5">
              <p className="text-sm text-destructive">
                Error loading products: {error?.message || "Unknown error"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No products match your filters
              </p>
              <p className="text-xs text-muted-foreground">
                Try clearing the search or stock filter.
              </p>
            </div>
          ) : (
            <DataTable
              data={products}
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

      <ProductDetailsDialog
        open={!!viewingProductId}
        onOpenChange={(open) => !open && setViewingProductId(null)}
        product={viewingProductData}
        isLoading={isLoadingProduct}
        isError={isProductError}
        onEdit={() => {
          if (!viewingProductData) return;
          setViewingProductId(null);
          setEditingProduct(viewingProductData);
          setIsFormDialogOpen(true);
        }}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/70"
            >
              {deleteProduct.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
