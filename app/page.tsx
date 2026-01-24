import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated via cookie
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token");

  if (!authToken) {
    redirect("/login");
  }

  redirect("/admin/dashboard");
}
