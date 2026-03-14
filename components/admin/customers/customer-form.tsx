"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Customer } from "@/app/api/customers/use-get-all";

const customerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 2,
      "Last name must be at least 2 characters",
    ),
  email: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" || z.string().email().safeParse(value).success,
      "Invalid email address",
    ),
  phoneNumber: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 10,
      "Phone number must be at least 10 characters",
    ),
  streetAddress: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 5,
      "Address must be at least 5 characters",
    ),
  city: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 2,
      "City must be at least 2 characters",
    ),
  state: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 2,
      "State must be at least 2 characters",
    ),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

type CustomerFormPayload = { firstName: string } & Partial<
  Omit<CustomerFormValues, "firstName">
>;

function stripEmptyFields(data: CustomerFormValues): CustomerFormPayload {
  const result: Partial<CustomerFormValues> = { firstName: data.firstName };
  const optional = [
    "lastName",
    "email",
    "phoneNumber",
    "streetAddress",
    "city",
    "state",
  ] as const;
  for (const key of optional) {
    if (data[key] !== undefined && data[key].trim() !== "") {
      result[key] = data[key];
    }
  }
  return result as CustomerFormPayload;
}

export type { CustomerFormPayload };

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
        },
  });

  const handleFormSubmit = (data: CustomerFormValues) => {
    onSubmit(stripEmptyFields(data));
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
          <Label htmlFor="lastName">Last Name</Label>
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
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="phoneNumber">Phone Number</Label>
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
        <Label htmlFor="streetAddress">Street Address</Label>
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
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Sialkot"
            error={!!errors.city}
            errorMessage={errors.city?.message}
            {...register("city")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            placeholder="Punjab"
            error={!!errors.state}
            errorMessage={errors.state?.message}
            {...register("state")}
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
            <span>{customer ? "Update" : "Create"} Customer</span>
          )}
        </Button>
      </div>
    </form>
  );
}
