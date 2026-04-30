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

const balanceAdjustmentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  direction: z.enum(["customer_owes", "we_owe_customer"]),
  note: z.string().optional(),
});

export type BalanceAdjustmentValues = z.infer<typeof balanceAdjustmentSchema>;

interface BalanceAdjustmentFormV2Props {
  onSubmit: (data: BalanceAdjustmentValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
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

export function BalanceAdjustmentFormV2({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BalanceAdjustmentFormV2Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<BalanceAdjustmentValues>({
    resolver: zodResolver(balanceAdjustmentSchema),
    defaultValues: {
      amount: 0,
      direction: "customer_owes",
      note: "",
    },
  });

  const handleFormSubmit = (data: BalanceAdjustmentValues) => {
    onSubmit(data);
    reset({ amount: 0, direction: "customer_owes", note: "" });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="rounded-lg border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Use this when an opening balance, write-off, or correction needs to
          be reflected on the customer&apos;s ledger without an order or
          payment.
        </p>
      </div>

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
              placeholder="1500"
              className="pl-12"
              error={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
          </div>
        </Field>

        <Field
          id="direction"
          label="Direction"
          required
          error={errors.direction?.message}
        >
          <Controller
            name="direction"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="direction"
                  className={cn(errors.direction && "border-destructive")}
                >
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_owes">Due payment</SelectItem>
                  <SelectItem value="we_owe_customer">
                    Advance payment
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field
        id="note"
        label="Note"
        hint="Optional. Explain why this adjustment is being made."
        error={errors.note?.message}
      >
        <Textarea
          id="note"
          placeholder="e.g. Carry-over balance from old ledger"
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
              Adjusting…
            </span>
          ) : (
            "Adjust balance"
          )}
        </Button>
      </div>
    </form>
  );
}
