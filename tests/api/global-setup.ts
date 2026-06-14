import { apiTestConfig } from "./config";

export async function setup() {
  if (apiTestConfig.skip) {
    console.warn("[api-tests] SKIP_API_TESTS=1 — integration tests will be skipped.");
    return;
  }

  try {
    const res = await fetch(new URL("/login", apiTestConfig.baseUrl), {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok && res.status !== 200) {
      console.warn(
        `[api-tests] ${apiTestConfig.baseUrl}/login returned ${res.status}. ` +
          "Start the app with npm run dev before running scenario tests.",
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[api-tests] Could not reach ${apiTestConfig.baseUrl} (${message}). ` +
        "Start the app with npm run dev — tests will fail at login.",
    );
  }
}

export async function teardown() {}
