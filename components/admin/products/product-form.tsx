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
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const productFormSchema = z
  .object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    shortDescription: z.string(),
    descriptionUrdu: z.string(),
    formulation: z.string().min(1, "Formulation is required"),
    packType: z.string().min(1, "Pack type is required"),
    customPackType: z.string().optional(),
    size: z.string().min(1, "Size is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    lowStockThreshold: z.string().min(1, "Low stock threshold is required"),
    quantityInStock: z.string().min(1, "Quantity in stock is required"),
    batchNo: z.string().optional(),
    expiry: z.string().optional(),
    mfg: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.packType === "other") {
        return data.customPackType && data.customPackType.trim().length > 0;
      }
      return true;
    },
    {
      message: "Custom pack type is required",
      path: ["customPackType"],
    },
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

// Type for the transformed data with numbers
type ProductFormOutput = {
  name: string;
  shortDescription: string;
  descriptionUrdu: string;
  formulation: string;
  packType: string;
  size: number;
  unitPrice: number;
  lowStockThreshold: number;
  quantityInStock: number;
  batchNo?: string;
  expiry?: string;
  mfg?: string;
};

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormOutput) => void;
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
          customPackType: (product as any).customPackType || "",
          size: String(product.size),
          unitPrice: String(product.unitPrice),
          lowStockThreshold: String(product.lowStockThreshold),
          quantityInStock: String(product.quantityInStock),
          batchNo: product.batchNo || "",
          expiry: product.expiry || "",
          mfg: product.mfg || "",
        }
      : {
          name: "",
          shortDescription: "",
          descriptionUrdu: "",
          formulation: "",
          packType: "",
          customPackType: "",
          size: "",
          unitPrice: "",
          lowStockThreshold: "",
          quantityInStock: "",
          batchNo: "",
          expiry: "",
          mfg: "",
        },
  });

  const formulation = watch("formulation");
  const packType = watch("packType");
  const mfgValue = watch("mfg");
  const expiryValue = watch("expiry");

  const handleFormSubmit = (data: ProductFormValues) => {
    // Convert string values to numbers before submitting
    // If packType is "other", replace it with the customPackType value
    const finalPackType =
      data.packType === "other" && data.customPackType
        ? data.customPackType
        : data.packType;

    const outputData: ProductFormOutput = {
      name: data.name,
      shortDescription: data.shortDescription,
      descriptionUrdu: data.descriptionUrdu,
      formulation: data.formulation,
      packType: finalPackType,
      size: Number(data.size),
      unitPrice: Number(data.unitPrice),
      lowStockThreshold: Number(data.lowStockThreshold),
      quantityInStock: Number(data.quantityInStock),
      batchNo: data.batchNo,
      expiry: data.expiry,
      mfg: data.mfg,
    };
    onSubmit(outputData);
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

      <div className="grid grid-cols-2 gap-4 relative">
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
              <SelectItem value="gram">Gram</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.packType && (
            <p className="text-sm text-red-500">{errors.packType.message}</p>
          )}
        </div>
        {packType === "other" && (
          <div className="space-y-2 absolute right-0 top-16 w-[48.3%]">
            <Input
              id="customPackType"
              className="max-h-8"
              placeholder="Enter custom pack type"
              error={!!errors.customPackType}
              errorMessage={errors.customPackType?.message}
              {...register("customPackType")}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="120"
            error={!!errors.size}
            errorMessage={errors.size?.message}
            {...register("size", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              },
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price (PKR)</Label>
          <Input
            id="unitPrice"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*\.?[0-9]*"
            placeholder="250"
            error={!!errors.unitPrice}
            errorMessage={errors.unitPrice?.message}
            {...register("unitPrice", {
              onChange: (e) => {
                e.target.value = e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*)\./g, "$1");
              },
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="20"
            error={!!errors.lowStockThreshold}
            errorMessage={errors.lowStockThreshold?.message}
            {...register("lowStockThreshold", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              },
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantityInStock">Quantity in Stock</Label>
          <Input
            id="quantityInStock"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="100"
            error={!!errors.quantityInStock}
            errorMessage={errors.quantityInStock?.message}
            {...register("quantityInStock", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              },
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batchNo">Batch No</Label>
          <Input
            id="batchNo"
            placeholder="AL-5433"
            error={!!errors.batchNo}
            errorMessage={errors.batchNo?.message}
            {...register("batchNo")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mfg">Mfg. Date</Label>
          <MonthYearPicker
            value={mfgValue}
            onChange={(value) => setValue("mfg", value)}
            placeholder="Select month/year"
            className="w-full"
          />
          {errors.mfg && (
            <p className="text-sm text-red-500">{errors.mfg.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry Date</Label>
          <MonthYearPicker
            value={expiryValue}
            onChange={(value) => setValue("expiry", value)}
            placeholder="Select month/year"
            className="w-full"
          />
          {errors.expiry && (
            <p className="text-sm text-red-500">{errors.expiry.message}</p>
          )}
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
