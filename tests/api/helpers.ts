import { beforeAll, describe } from "vitest";
import { apiTestConfig } from "./config";
import { ApiClient } from "./client";

export const describeApi = apiTestConfig.skip ? describe.skip : describe;

export function useAuthenticatedClient() {
  let client: ApiClient;

  beforeAll(async () => {
    client = await ApiClient.login();
  }, 60_000);

  return {
    getClient: () => client,
  };
}
