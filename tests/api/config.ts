/** Use API_TEST_BASE_URL — not BASE_URL (Vitest/Vite reserves BASE_URL as "."). */
function resolveBaseUrl(): string {
  const raw =
    process.env.API_TEST_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";
  if (!raw.startsWith("http")) {
    return "http://localhost:3000";
  }
  return raw.replace(/\/$/, "");
}

export const apiTestConfig = {
  baseUrl: resolveBaseUrl(),
  email: process.env.REGRESSION_EMAIL ?? "admin@saiban.com",
  password: process.env.REGRESSION_PASSWORD ?? "Admin@123",
  runId: `api-scenario-${Date.now()}`,
  /** Set SKIP_API_TESTS=1 to skip integration tests in CI without a backend. */
  skip: process.env.SKIP_API_TESTS === "1",
};
