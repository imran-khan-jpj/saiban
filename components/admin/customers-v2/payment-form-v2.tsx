"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { cn } from "@/lib/utils";

const paymentFormSchema = z.object({
  orderId: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.enum(["cash", "jazzcash", "easypaisa", "bank_transfer"]),
  note: z.string(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormV2Props {
  onSubmit: (data: PaymentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultOrderId?: string;
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

const PAYMENT_METHODS: { value: PaymentFormValues["paymentMethod"]; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "bank_transfer", label: "Bank transfer" },
];

export function PaymentFormV2({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultOrderId = "",
}: PaymentFormV2Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      orderId: defaultOrderId,
      amount: 0,
      paymentMethod: "cash",
      note: "",
    },
  });

  const handleFormSubmit = (data: PaymentFormValues) => {
    onSubmit(data);
    reset({
      orderId: defaultOrderId,
      amount: 0,
      paymentMethod: "cash",
      note: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="amount"
          label="Amount"
          required
          error={errors.amount?.message}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              PKR
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="5000"
              className="pl-12"
              error={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
          </div>
        </Field>

        <Field
          id="paymentMethod"
          label="Payment method"
          required
          error={errors.paymentMethod?.message}
        >
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="paymentMethod"
                  className={cn(
                    errors.paymentMethod && "border-destructive",
                  )}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field
        id="note"
        label="Note"
        hint="Optional. Useful for reconciliation later."
        error={errors.note?.message}
      >
        <Textarea
          id="note"
          placeholder="e.g. Cleared invoice #123 in cash"
          className={cn(errors.note && "border-destructive")}
          {...register("note")}
        />
      </Field>

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
              Recording…
            </span>
          ) : (
            "Record payment"
          )}
        </Button>
      </div>
    </form>
  );
}
