"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useRegister } from "@/app/api/auth/use-register";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/providers/app-provider";
import { ADMIN_HOME_PATH } from "@/lib/admin-routes";
import Link from "next/link";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const router = useRouter();
  const { mutate, isPending } = useRegister();
  const { setUser } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: (data) => {
          const userName =
            data.user.name?.trim() || data.user.email.split("@")[0];
          setUser({
            id: data.user.id,
            name: userName,
            email: data.user.email,
            role: data.user.role,
            avatar: "",
          });
          toast.success("Registration successful!");
          router.push(ADMIN_HOME_PATH);
        },
        onError: (error) => {
          toast.error(error.message || "Registration failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              {...register("name")}
              placeholder="Full Name"
              id="name"
              type="text"
              error={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              placeholder="Email"
              id="email"
              type="email"
              error={!!errors.email}
              errorMessage={errors.email?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              placeholder="Password"
              id="password"
              type="password"
              error={!!errors.password}
              errorMessage={errors.password?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              {...register("confirmPassword")}
              placeholder="Confirm Password"
              id="confirmPassword"
              type="password"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Sign up"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Back to login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
