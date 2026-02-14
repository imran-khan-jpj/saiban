"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconDotsVertical,
  IconFilter,
  IconX,
  IconEye,
  IconSearch,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductForm } from "./product-form";
import { useGetAllProducts, Product } from "@/app/api/products/use-get-all";
import { useGetProductById } from "@/app/api/products/use-get-by-id";
import { useCreateProduct } from "@/app/api/products/use-create";
import { useUpdateProduct } from "@/app/api/products/use-update";
import { useDeleteProduct } from "@/app/api/products/use-delete";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Re-export Product type
export type { Product };

interface ProductsProps {
  searchInput: string;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}

export function Products({
  searchInput,
  stockStatus,
  onStockStatusChange,
  setSearchInput,
}: ProductsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null,
  );
  const [viewingProductId, setViewingProductId] = React.useState<string | null>(
    null,
  );
  const [deletingProductId, setDeletingProductId] = React.useState<
    string | null
  >(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      // Reset to first page when search changes
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to first page when stock status changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [stockStatus]);

  // Fetch products from API with pagination
  const { data, isLoading, isError, error } = useGetAllProducts(
    pagination.pageIndex + 1, // API uses 1-based page numbering
    pagination.pageSize,
    debouncedSearch || undefined,
    stockStatus || undefined,
  );

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Fetch single product for viewing
  const {
    data: viewingProductData,
    isLoading: isLoadingProduct,
    isError: isProductError,
  } = useGetProductById(viewingProductId);

  // Transform data for DataTable (add id field)
  const products = React.useMemo(() => {
    return (data?.data || []).map((product) => ({
      ...product,
      id: product._id, // Add id field for DataTable
    }));
  }, [data]);

  // Column definitions
  const columns: ColumnDef<Product & { id: string }>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      size: 200,
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "shortDescription",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-xs truncate">
          {row.original.shortDescription}
        </div>
      ),
    },
    {
      accessorKey: "formulation",
      header: "Formulation",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.formulation}
        </Badge>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <div>
          {row.original.size} {row.original.packType}
        </div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: "Unit Price",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.unitPrice)}
        </div>
      ),
    },
    {
      accessorKey: "quantityInStock",
      header: "Stock",
      cell: ({ row }) => {
        const isLowStock =
          row.original.quantityInStock <= row.original.lowStockThreshold;
        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? "text-destructive font-medium" : ""}>
              {row.original.quantityInStock}
            </span>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs text-white">
                Low
              </Badge>
            )}
          </div>
        );
      },
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
              <DropdownMenuItem onClick={() => handleView(row.original._id)}>
                <IconEye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
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

  const handleAddProduct = (
    data: Omit<Product, "_id" | "createdAt" | "updatedAt" | "__v">,
  ) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        toast.success("Product created successfully");
        setIsAddDialogOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to create product: ${error.message}`);
      },
    });
  };

  const handleEdit = (product: Product & { id: string }) => {
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleView = (productId: string) => {
    setViewingProductId(productId);
  };

  const handleUpdateProduct = (
    data: Omit<Product, "_id" | "createdAt" | "updatedAt" | "__v">,
  ) => {
    if (!editingProduct) return;

    updateProduct.mutate(
      { productId: editingProduct._id, data },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
          setIsAddDialogOpen(false);
          setEditingProduct(null);
        },
        onError: (error) => {
          toast.error(`Failed to update product: ${error.message}`);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    setDeletingProductId(id);
  };

  const handleConfirmDelete = () => {
    if (!deletingProductId) return;

    deleteProduct.mutate(deletingProductId, {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setDeletingProductId(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete product: ${error.message}`);
        setDeletingProductId(null);
      },
    });
  };

  const handleCancelDelete = () => {
    setDeletingProductId(null);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
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
          Error loading products: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      <div className="shrink-0 flex items-center justify-between mt-2">
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={stockStatus} onValueChange={onStockStatusChange}>
              <SelectTrigger className="w-45">
                <IconFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {stockStatus && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onStockStatusChange("")}
                title="Clear filter"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Update product information below."
                    : "Fill in the details to add a new product."}
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSubmit={
                  editingProduct ? handleUpdateProduct : handleAddProduct
                }
                onCancel={handleDialogClose}
                isSubmitting={
                  createProduct.isPending || updateProduct.isPending
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          data={products}
          columns={columns}
          enableRowSelection={false}
          manualPagination={true}
          pageCount={data?.pagination.pages}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>

      {/* View Product Dialog */}
      <Dialog
        open={!!viewingProductId}
        onOpenChange={(open) => !open && setViewingProductId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product
            </DialogDescription>
          </DialogHeader>
          {isLoadingProduct && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {isProductError && (
            <div className="rounded-lg border border-destructive p-4">
              <p className="text-destructive">
                Error loading product details. Please try again.
              </p>
            </div>
          )}
          {viewingProductData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Product Name</Label>
                  <p className="font-medium">{viewingProductData.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Formulation</Label>
                  <Badge variant="outline" className="capitalize">
                    {viewingProductData.formulation}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Description (English)
                  </Label>
                  <p>{viewingProductData.shortDescription}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Description (Urdu)
                  </Label>
                  <p dir="rtl">{viewingProductData.descriptionUrdu}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Size</Label>
                  <p>
                    {viewingProductData.size} {viewingProductData.packType}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Unit Price</Label>
                  <p className="font-medium">
                    {formatCurrency(viewingProductData.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Quantity in Stock
                  </Label>
                  <div className="flex items-center gap-2">
                    <p
                      className={
                        viewingProductData.quantityInStock <=
                        viewingProductData.lowStockThreshold
                          ? "text-destructive font-medium"
                          : "font-medium"
                      }
                    >
                      {viewingProductData.quantityInStock}
                    </p>
                    {viewingProductData.quantityInStock <=
                      viewingProductData.lowStockThreshold && (
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Low Stock Threshold
                  </Label>
                  <p>{viewingProductData.lowStockThreshold}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="text-sm">
                    {formatDate(viewingProductData.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove it from inventory.
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
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
