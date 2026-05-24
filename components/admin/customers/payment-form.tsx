"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { roundCurrency, sanitizeCurrencyInput } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const paymentFormSchema = z.object({
  orderId: z.string().optional(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value),
      "Amount can have at most 2 decimal places",
    )
    .refine(
      (value) => parseFloat(value) >= 0.01,
      "Amount must be at least PKR 0.01",
    ),
  paymentMethod: z.enum(["cash", "jazzcash", "easypaisa", "bank_transfer"]),
  note: z.string(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export type PaymentFormOutput = Omit<PaymentFormValues, "amount"> & {
  amount: number;
};

interface PaymentFormProps {
  onSubmit: (data: PaymentFormOutput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultOrderId?: string;
}

export function PaymentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultOrderId = "",
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      orderId: defaultOrderId,
      amount: "",
      paymentMethod: "cash",
      note: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const handleFormSubmit = (data: PaymentFormValues) => {
    onSubmit({
      ...data,
      amount: roundCurrency(Number(data.amount)),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="250.50"
          error={!!errors.amount}
          errorMessage={errors.amount?.message}
          {...register("amount", {
            onChange: (e) => {
              e.target.value = sanitizeCurrencyInput(e.target.value);
            },
          })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method *</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) =>
            setValue(
              "paymentMethod",
              value as PaymentFormValues["paymentMethod"],
            )
          }
        >
          <SelectTrigger
            className={errors.paymentMethod ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="jazzcash">JazzCash</SelectItem>
            <SelectItem value="easypaisa">EasyPaisa</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Payment received"
          className={errors.note ? "border-red-500" : ""}
          {...register("note")}
        />
        {errors.note && (
          <p className="text-sm text-red-500">{errors.note.message}</p>
        )}
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
              Recording...
            </span>
          ) : (
            "Record Payment"
          )}
        </Button>
      </div>
    </form>
  );
}
