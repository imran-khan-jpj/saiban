"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/app/api/auth/use-forgot-password";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate(
      { email: data.email },
      {
        onSuccess: () => {
          toast.success("If an account exists, a reset link has been sent.");
        },
        onError: (error) => {
          if (error.status === 429) {
            toast.error(
              "Too many reset requests. Please wait a few minutes and try again.",
            );
            return;
          }
          toast.error(error.message || "Unable to send reset email");
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        description="If an account exists for that address, we sent password reset instructions."
      >
        <div className="space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sent to{" "}
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
            . The link expires in 1 hour.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try another email
            </Button>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email on your account and we'll send you a reset link."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={!!errors.email}
            errorMessage={errors.email?.message}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send reset link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
