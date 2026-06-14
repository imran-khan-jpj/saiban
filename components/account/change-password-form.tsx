"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChangePassword } from "@/app/api/auth/use-change-password";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
          toast.success("Password updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Unable to change password");
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password. You will stay signed in on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              {...register("currentPassword")}
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              error={!!errors.currentPassword}
              errorMessage={errors.currentPassword?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              {...register("newPassword")}
              id="newPassword"
              type="password"
              autoComplete="new-password"
              error={!!errors.newPassword}
              errorMessage={errors.newPassword?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
