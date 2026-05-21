/**
 * Logout function that clears the auth cookie (server-side, HttpOnly)
 * and redirects to login page.
 */
export const logout = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};
