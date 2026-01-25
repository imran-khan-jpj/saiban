"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Product } from "@/app/api/products/use-get-all";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  shortDescription: z
    .string()
    .min(5, "Short description must be at least 5 characters"),
  descriptionUrdu: z
    .string()
    .min(5, "Urdu description must be at least 5 characters"),
  formulation: z.string().min(1, "Formulation is required"),
  packType: z.string().min(1, "Pack type is required"),
  size: z.number().min(1, "Size must be at least 1"),
  unitPrice: z.number().min(1, "Unit price must be at least 1"),
  lowStockThreshold: z
    .number()
    .min(0, "Low stock threshold must be at least 0"),
  quantityInStock: z.number().min(0, "Quantity in stock must be at least 0"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          shortDescription: product.shortDescription,
          descriptionUrdu: product.descriptionUrdu,
          formulation: product.formulation,
          packType: product.packType,
          size: product.size,
          unitPrice: product.unitPrice,
          lowStockThreshold: product.lowStockThreshold,
          quantityInStock: product.quantityInStock,
        }
      : {
          name: "",
          shortDescription: "",
          descriptionUrdu: "",
          formulation: "",
          packType: "",
          size: 0,
          unitPrice: 0,
          lowStockThreshold: 0,
          quantityInStock: 0,
        },
  });

  const formulation = watch("formulation");
  const packType = watch("packType");

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          placeholder="Saiban Syrup 120ml"
          error={!!errors.name}
          errorMessage={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description (English)</Label>
          <Input
            id="shortDescription"
            placeholder="Pain relief syrup for adults and children"
            error={!!errors.shortDescription}
            errorMessage={errors.shortDescription?.message}
            {...register("shortDescription")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionUrdu">Description (Urdu)</Label>
          <Input
            id="descriptionUrdu"
            placeholder="درد کی دوا بڑوں اور بچوں کے لیے"
            error={!!errors.descriptionUrdu}
            errorMessage={errors.descriptionUrdu?.message}
            {...register("descriptionUrdu")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="formulation">Formulation</Label>
          <Select
            value={formulation}
            onValueChange={(value) => setValue("formulation", value)}
          >
            <SelectTrigger
              id="formulation"
              className={errors.formulation ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select formulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="syrup">Syrup</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="capsule">Capsule</SelectItem>
              <SelectItem value="injection">Injection</SelectItem>
              <SelectItem value="cream">Cream</SelectItem>
              <SelectItem value="drops">Drops</SelectItem>
            </SelectContent>
          </Select>
          {errors.formulation && (
            <p className="text-sm text-red-500">{errors.formulation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="packType">Pack Type</Label>
          <Select
            value={packType}
            onValueChange={(value) => setValue("packType", value)}
          >
            <SelectTrigger
              id="packType"
              className={errors.packType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select pack type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tabs">Tabs</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.packType && (
            <p className="text-sm text-red-500">{errors.packType.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            type="number"
            placeholder="120"
            error={!!errors.size}
            errorMessage={errors.size?.message}
            {...register("size", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price (PKR)</Label>
          <Input
            id="unitPrice"
            type="number"
            placeholder="250"
            error={!!errors.unitPrice}
            errorMessage={errors.unitPrice?.message}
            {...register("unitPrice", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            placeholder="20"
            error={!!errors.lowStockThreshold}
            errorMessage={errors.lowStockThreshold?.message}
            {...register("lowStockThreshold", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantityInStock">Quantity in Stock</Label>
          <Input
            id="quantityInStock"
            type="number"
            placeholder="100"
            error={!!errors.quantityInStock}
            errorMessage={errors.quantityInStock?.message}
            {...register("quantityInStock", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4" />
              Saving...
            </span>
          ) : (
            <span>{product ? "Update" : "Create"} Product</span>
          )}
        </Button>
      </div>
    </form>
  );
}
