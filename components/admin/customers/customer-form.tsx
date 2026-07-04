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
import { cn } from "@/lib/utils";
import type { Customer } from "@/app/api/customers/use-get-all";

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
    const formData: CustomerFormPayload = { firstName: data.firstName };
    if (data.lastName?.trim()) formData.lastName = data.lastName;
    if (data.email?.trim()) formData.email = data.email;
    if (data.phoneNumber?.trim()) formData.phoneNumber = data.phoneNumber;
    if (data.streetAddress?.trim()) formData.streetAddress = data.streetAddress;
    if (data.city?.trim()) formData.city = data.city;
    if (data.state?.trim()) formData.state = data.state;
    if (
      data.balanceAdjustment?.amount &&
      !isNaN(data.balanceAdjustment.amount) &&
      data.balanceAdjustment.amount > 0
    ) {
      formData.balanceAdjustment = data.balanceAdjustment;
    }

    onSubmit(formData);
    if (!customer) reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      autoComplete="on"
    >
      {/* Identity */}
      <Section
        title="Identity"
        description="Who this customer is. First name is required, the rest is optional."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            required
            error={errors.firstName?.message}
          >
            <Input
              id="firstName"
              placeholder="Ahmed"
              autoComplete="given-name"
              error={!!errors.firstName}
              {...register("firstName")}
            />
          </Field>
          <Field
            id="lastName"
            label="Last name"
            error={errors.lastName?.message}
          >
            <Input
              id="lastName"
              placeholder="Khan"
              autoComplete="family-name"
              error={!!errors.lastName}
              {...register("lastName")}
            />
          </Field>
        </div>
      </Section>

      <div className="border-t" />

      {/* Contact */}
      <Section
        title="Contact"
        description="How to reach this customer. All fields are optional."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="ahmed.khan@example.com"
              autoComplete="email"
              error={!!errors.email}
              {...register("email")}
            />
          </Field>
          <Field
            id="phoneNumber"
            label="Phone number"
            error={errors.phoneNumber?.message}
          >
            <Input
              id="phoneNumber"
              placeholder="+92-300-9876543"
              autoComplete="tel"
              error={!!errors.phoneNumber}
              {...register("phoneNumber")}
            />
          </Field>
        </div>
      </Section>

      <div className="border-t" />

      {/* Address */}
      <Section
        title="Address"
        description="Where to ship orders or deliver invoices."
      >
        <Field
          id="streetAddress"
          label="Street address"
          error={errors.streetAddress?.message}
        >
          <Input
            id="streetAddress"
            placeholder="House 123, Street 5, Block A"
            autoComplete="street-address"
            error={!!errors.streetAddress}
            {...register("streetAddress")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="city" label="City" error={errors.city?.message}>
            <Input
              id="city"
              placeholder="Sialkot"
              autoComplete="address-level2"
              error={!!errors.city}
              {...register("city")}
            />
          </Field>
          <Field
            id="state"
            label="State / province"
            error={errors.state?.message}
          >
            <Input
              id="state"
              placeholder="Punjab"
              autoComplete="address-level1"
              error={!!errors.state}
              {...register("state")}
            />
          </Field>
        </div>
      </Section>

      {!customer && (
        <>
          <div className="border-t" />

          {/* Opening balance */}
          <Section
            title="Opening balance"
            description="Optional. Carry over a balance from a previous ledger when adding the customer."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="balanceAmount"
                label="Amount"
                error={errors.balanceAdjustment?.amount?.message}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    PKR
                  </span>
                  <Input
                    id="balanceAmount"
                    type="number"
                    placeholder="1500"
                    className="pl-12"
                    error={!!errors.balanceAdjustment?.amount}
                    {...register("balanceAdjustment.amount", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </Field>

              <Field
                id="balanceDirection"
                label="Direction"
                error={errors.balanceAdjustment?.direction?.message}
              >
                <Controller
                  name="balanceAdjustment.direction"
                  control={control}
                  defaultValue="customer_owes"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="balanceDirection"
                        className={cn(
                          errors.balanceAdjustment?.direction &&
                            "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_owes">
                          Due payment
                        </SelectItem>
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
              id="balanceNote"
              label="Note"
              error={errors.balanceAdjustment?.note?.message}
            >
              <Textarea
                id="balanceNote"
                placeholder="Opening balance from previous ledger"
                className={cn(
                  errors.balanceAdjustment?.note && "border-destructive",
                )}
                {...register("balanceAdjustment.note")}
              />
            </Field>
          </Section>
        </>
      )}

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
            <span>{customer ? "Save changes" : "Create customer"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
