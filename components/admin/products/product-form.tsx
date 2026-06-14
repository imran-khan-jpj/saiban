"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { cn, roundCurrency, sanitizeCurrencyInput } from "@/lib/utils";
import type { Product } from "@/app/api/products/use-get-all";

const productFormSchema = z
  .object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    shortDescription: z.string(),
    descriptionUrdu: z.string(),
    formulation: z.string().min(1, "Formulation is required"),
    packType: z.string().min(1, "Pack type is required"),
    customPackType: z.string().optional(),
    size: z.string().min(1, "Size is required"),
    unitPrice: z
      .string()
      .min(1, "Unit price is required")
      .refine(
        (value) => /^\d+(\.\d{1,2})?$/.test(value),
        "Unit price can have at most 2 decimal places",
      ),
    lowStockThreshold: z.string().min(1, "Low stock threshold is required"),
    quantityInStock: z.string().min(1, "Quantity in stock is required"),
    batchNo: z.string().optional(),
    expiry: z.string().optional(),
    mfg: z.string().optional(),
  })
  .refine(
    (data) =>
      data.packType !== "other" ||
      (!!data.customPackType && data.customPackType.trim().length > 0),
    {
      message: "Custom pack type is required",
      path: ["customPackType"],
    },
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductFormOutput = {
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

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="flex items-center gap-1 text-xs font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const formationOptions = [
  { value: "syrup", label: "Syrup" },
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "injection", label: "Injection" },
  { value: "cream", label: "Cream" },
  { value: "drops", label: "Drops" },
];

const packTypeOptions = [
  { value: "tabs", label: "Tabs" },
  { value: "ml", label: "ml" },
  { value: "gram", label: "Gram" },
  { value: "other", label: "Other" },
];

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const finalPackType =
      data.packType === "other" && data.customPackType
        ? data.customPackType
        : data.packType;

    onSubmit({
      name: data.name,
      shortDescription: data.shortDescription,
      descriptionUrdu: data.descriptionUrdu,
      formulation: data.formulation,
      packType: finalPackType,
      size: Number(data.size),
      unitPrice: roundCurrency(Number(data.unitPrice)),
      lowStockThreshold: Number(data.lowStockThreshold),
      quantityInStock: Number(data.quantityInStock),
      batchNo: data.batchNo,
      expiry: data.expiry,
      mfg: data.mfg,
    });
    if (!product) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic info */}
      <Section
        title="Basic information"
        description="What this product is and how it's described to customers."
      >
        <Field
          id="name"
          label="Product name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="e.g. Saiban Syrup 120ml"
            error={!!errors.name}
            {...register("name")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="shortDescription"
            label="Description (English)"
            error={errors.shortDescription?.message}
          >
            <Input
              id="shortDescription"
              placeholder="e.g. Pain relief syrup for adults and children"
              error={!!errors.shortDescription}
              {...register("shortDescription")}
            />
          </Field>
          <Field
            id="descriptionUrdu"
            label="Description (Urdu)"
            error={errors.descriptionUrdu?.message}
          >
            <Input
              id="descriptionUrdu"
              dir="rtl"
              placeholder="درد کی دوا بڑوں اور بچوں کے لیے"
              error={!!errors.descriptionUrdu}
              {...register("descriptionUrdu")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="formulation"
            label="Formulation"
            required
            error={errors.formulation?.message}
          >
            <Select
              value={formulation}
              onValueChange={(value) => setValue("formulation", value)}
            >
              <SelectTrigger
                id="formulation"
                className={cn(errors.formulation && "border-destructive")}
              >
                <SelectValue placeholder="Select formulation" />
              </SelectTrigger>
              <SelectContent>
                {formationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="packType"
            label="Pack type"
            required
            error={errors.packType?.message}
          >
            <Select
              value={packType}
              onValueChange={(value) => setValue("packType", value)}
            >
              <SelectTrigger
                id="packType"
                className={cn(errors.packType && "border-destructive")}
              >
                <SelectValue placeholder="Select pack type" />
              </SelectTrigger>
              <SelectContent>
                {packTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {packType === "other" && (
            <Field
              id="customPackType"
              label="Custom pack type"
              required
              error={errors.customPackType?.message}
              className="sm:col-span-2"
            >
              <Input
                id="customPackType"
                placeholder="e.g. sachet, vial, ampoule"
                error={!!errors.customPackType}
                {...register("customPackType")}
              />
            </Field>
          )}
        </div>
      </Section>

      <div className="border-t" />

      {/* Pricing & inventory */}
      <Section
        title="Pricing & inventory"
        description="What you charge and how much stock you keep on hand."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="size"
            label="Size"
            required
            error={errors.size?.message}
            hint={packType ? `Numeric value in ${packType}` : "Numeric value"}
          >
            <div className="relative">
              <Input
                id="size"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="120"
                className={cn(packType && "pr-12")}
                error={!!errors.size}
                {...register("size", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  },
                })}
              />
              {packType && packType !== "other" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {packType}
                </span>
              )}
            </div>
          </Field>

          <Field
            id="unitPrice"
            label="Unit price"
            required
            error={errors.unitPrice?.message}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                PKR
              </span>
              <Input
                id="unitPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*\.?[0-9]*"
                placeholder="250"
                className="pl-12"
                error={!!errors.unitPrice}
                {...register("unitPrice", {
                  onChange: (e) => {
                    e.target.value = sanitizeCurrencyInput(e.target.value);
                  },
                })}
              />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="quantityInStock"
            label="Quantity in stock"
            required
            error={errors.quantityInStock?.message}
            hint="How many units are available right now"
          >
            <Input
              id="quantityInStock"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="100"
              error={!!errors.quantityInStock}
              {...register("quantityInStock", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                },
              })}
            />
          </Field>

          <Field
            id="lowStockThreshold"
            label="Low stock threshold"
            required
            error={errors.lowStockThreshold?.message}
            hint="Trigger a warning when stock falls to or below this number"
          >
            <Input
              id="lowStockThreshold"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="20"
              error={!!errors.lowStockThreshold}
              {...register("lowStockThreshold", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                },
              })}
            />
          </Field>
        </div>
      </Section>

      <div className="border-t" />

      {/* Batch tracking */}
      <Section
        title="Batch tracking"
        description="Optional. Helpful for compliance and recall traceability."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            id="batchNo"
            label="Batch number"
            error={errors.batchNo?.message}
          >
            <Input
              id="batchNo"
              placeholder="e.g. AL-5433"
              error={!!errors.batchNo}
              {...register("batchNo")}
            />
          </Field>

          <Field id="mfg" label="Manufactured" error={errors.mfg?.message}>
            <MonthYearPicker
              value={mfgValue}
              onChange={(value) => setValue("mfg", value)}
              placeholder="Select month/year"
              className="w-full"
            />
          </Field>

          <Field id="expiry" label="Expires" error={errors.expiry?.message}>
            <MonthYearPicker
              value={expiryValue}
              onChange={(value) => setValue("expiry", value)}
              placeholder="Select month/year"
              className="w-full"
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end gap-2 border-t pt-4">
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
              Saving…
            </span>
          ) : (
            <span>{product ? "Save changes" : "Create product"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
