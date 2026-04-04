"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer } from "@/app/api/customers/use-get-all";

const customerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional()
    .or(z.literal("")),
  streetAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  balanceAdjustment: z
    .object({
      amount: z.number().min(0, "Amount cannot be negative").optional(),
      direction: z.enum(["customer_owes", "we_owe_customer"]),
      note: z.string().optional(),
    })
    .optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export type CustomerFormPayload = {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  balanceAdjustment?: {
    amount?: number;
    direction: "customer_owes" | "we_owe_customer";
    note?: string;
  };
};

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer
      ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          streetAddress: customer.streetAddress,
          city: customer.city,
          state: customer.state,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          streetAddress: "",
          city: "",
          state: "",
          balanceAdjustment: {
            amount: 0,
            direction: "customer_owes",
          },
        },
  });

  const handleFormSubmit = (data: CustomerFormValues) => {
    // Clean up the data - convert empty strings to undefined and remove balanceAdjustment if not filled
    const formData: CustomerFormPayload = {
      firstName: data.firstName,
    };

    // Add optional fields only if they have values
    if (data.lastName && data.lastName.trim() !== "") {
      formData.lastName = data.lastName;
    }
    if (data.email && data.email.trim() !== "") {
      formData.email = data.email;
    }
    if (data.phoneNumber && data.phoneNumber.trim() !== "") {
      formData.phoneNumber = data.phoneNumber;
    }
    if (data.streetAddress && data.streetAddress.trim() !== "") {
      formData.streetAddress = data.streetAddress;
    }
    if (data.city && data.city.trim() !== "") {
      formData.city = data.city;
    }
    if (data.state && data.state.trim() !== "") {
      formData.state = data.state;
    }

    // Add balanceAdjustment only if amount is provided and greater than 0
    if (
      data.balanceAdjustment?.amount &&
      !isNaN(data.balanceAdjustment.amount) &&
      data.balanceAdjustment.amount > 0
    ) {
      formData.balanceAdjustment = data.balanceAdjustment;
    }

    onSubmit(formData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Ahmed"
            error={!!errors.firstName}
            errorMessage={errors.firstName?.message}
            {...register("firstName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name (Optional)</Label>
          <Input
            id="lastName"
            placeholder="Khan"
            error={!!errors.lastName}
            errorMessage={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="ahmed.khan@example.com"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            placeholder="+92-300-9876543"
            error={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address (Optional)</Label>
        <Input
          id="streetAddress"
          placeholder="House 123, Street 5, Block A"
          error={!!errors.streetAddress}
          errorMessage={errors.streetAddress?.message}
          {...register("streetAddress")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City (Optional)</Label>
          <Input
            id="city"
            placeholder="Sialkot"
            error={!!errors.city}
            errorMessage={errors.city?.message}
            {...register("city")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province (Optional)</Label>
          <Input
            id="state"
            placeholder="Punjab"
            error={!!errors.state}
            errorMessage={errors.state?.message}
            {...register("state")}
          />
        </div>
      </div>

      {/* Balance Adjustment Section - Only show when creating new customer */}
      {!customer && (
        <div className="border-t pt-4 mt-6">
          <h3 className="text-sm font-semibold mb-4">
            Opening Balance (Optional)
          </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="balanceAmount">Amount</Label>
            <Input
              id="balanceAmount"
              type="number"
              placeholder="1500"
              error={!!errors.balanceAdjustment?.amount}
              errorMessage={errors.balanceAdjustment?.amount?.message}
              {...register("balanceAdjustment.amount", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balanceDirection">Direction</Label>
            <Controller
              name="balanceAdjustment.direction"
              control={control}
              defaultValue="customer_owes"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="balanceDirection"
                    className={
                      errors.balanceAdjustment?.direction
                        ? "border-destructive"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_owes">Customer Owes</SelectItem>
                    <SelectItem value="we_owe_customer">
                      We Owe Customer
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.balanceAdjustment?.direction && (
              <p className="text-sm text-destructive">
                {errors.balanceAdjustment.direction.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="balanceNote">Note</Label>
          <Textarea
            id="balanceNote"
            placeholder="Opening balance from previous ledger"
            className={
              errors.balanceAdjustment?.note ? "border-destructive" : ""
            }
            {...register("balanceAdjustment.note")}
          />
          {errors.balanceAdjustment?.note && (
            <p className="text-sm text-destructive">
              {errors.balanceAdjustment.note.message}
            </p>
          )}
        </div>
        </div>
      )}

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
            <span>{customer ? "Update" : "Create"} Customer</span>
          )}
        </Button>
      </div>
    </form>
  );
}
