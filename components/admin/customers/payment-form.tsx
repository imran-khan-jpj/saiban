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
  amount: z.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.enum([
    "on_account",
    "cash",
    "jazzcash",
    "bank_transfer",
    "card",
    "other",
  ]),
  reference: z.string().min(1, "Reference is required"),
  note: z.string().min(1, "Note is required"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PaymentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
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
      orderId: "",
      amount: 0,
      paymentMethod: "cash",
      reference: "",
      note: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const handleFormSubmit = (data: PaymentFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orderId">Order ID (Optional)</Label>
        <Input
          id="orderId"
          placeholder="Enter order ID if payment is for specific order"
          {...register("orderId")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          placeholder="5000"
          error={!!errors.amount}
          errorMessage={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
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
            <SelectItem value="on_account">On Account</SelectItem>
            <SelectItem value="jazzcash">JazzCash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference *</Label>
        <Input
          id="reference"
          placeholder="CASH-001"
          error={!!errors.reference}
          errorMessage={errors.reference?.message}
          {...register("reference")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note *</Label>
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
