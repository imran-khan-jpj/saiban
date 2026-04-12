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

// Form validation schema
const balanceAdjustmentFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  direction: z.enum(["customer_owes", "we_owe_customer"]),
  note: z.string().optional(),
});

type BalanceAdjustmentFormValues = z.infer<typeof balanceAdjustmentFormSchema>;

interface BalanceAdjustmentFormProps {
  onSubmit: (data: BalanceAdjustmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BalanceAdjustmentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BalanceAdjustmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<BalanceAdjustmentFormValues>({
    resolver: zodResolver(balanceAdjustmentFormSchema),
    defaultValues: {
      amount: 0,
      direction: "customer_owes",
      note: "",
    },
  });

  const handleFormSubmit = (data: BalanceAdjustmentFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          placeholder="1500"
          error={!!errors.amount}
          errorMessage={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="direction">Direction *</Label>
        <Controller
          name="direction"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                id="direction"
                className={errors.direction ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_owes">Due payment</SelectItem>
                <SelectItem value="we_owe_customer">Advance payment</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.direction && (
          <p className="text-sm text-destructive">{errors.direction.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Balance adjustment reason..."
          className={errors.note ? "border-destructive" : ""}
          {...register("note")}
        />
        {errors.note && (
          <p className="text-sm text-destructive">{errors.note.message}</p>
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
              Adjusting...
            </span>
          ) : (
            "Adjust Balance"
          )}
        </Button>
      </div>
    </form>
  );
}
