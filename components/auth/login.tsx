"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useLogin } from "@/app/api/auth/use-login";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/cookies";
import { useApp } from "@/providers/app-provider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const router = useRouter();
  const { mutate, isPending } = useLogin();
  const { setUser } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    // defaultValues: { email: "admin@saiban.com", password: "Admin@123" },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (data) => {
          setAuthToken(data.access_token);
          setUser({
            id: data.user.id,
            name: data.user.email.split("@")[0],
            email: data.user.email,
            role: data.user.role,
            avatar: "/avatars/shadcn.jpg",
          });
          toast.success("Login successful!");
          router.push("/admin/dashboard");
        },
        onError: (error) => {
          toast.error(error.message || "Login failed");
          console.error("Login failed:", error.message);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

          <div className="flex items-center justify-end text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
