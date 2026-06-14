"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/app/api/auth/use-reset-password";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const { mutate, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success("Password updated. You can sign in now.");
          router.push("/login");
        },
        onError: (error) => {
          toast.error(error.message || "Unable to reset password");
        },
      },
    );
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        description="This password reset link is missing or invalid."
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Request a new link from the forgot password page.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a strong password you haven't used before."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            {...register("password")}
            id="password"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            error={!!errors.password}
            errorMessage={errors.password?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating..." : "Update password"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
