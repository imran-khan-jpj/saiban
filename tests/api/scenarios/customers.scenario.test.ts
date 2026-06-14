import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiClient } from "../client";
import {
  expectBody,
  expectStatus,
  customerListSchema,
  customerSchema,
  customerWithBalanceSchema,
  nestErrorSchema,
} from "../assertions";
import {
  invalidMongoId,
  uniqueSuffix,
  validCustomerPayload,
} from "../fixtures";
import { describeApi } from "../helpers";

describeApi("Customers API scenarios", () => {
  let client: ApiClient;
  let customerId: string | null = null;

  beforeAll(async () => {
    client = await ApiClient.login();
  }, 60_000);

  afterAll(async () => {
    if (customerId) {
      await client.delete(`/api/customers/${customerId}`);
    }
  });

  describe("GET /api/customers", () => {
    it("returns paginated list", async () => {
      const res = await client.get("/api/customers?page=1&limit=5&sort=recent");
      expectStatus(res, 200);
      expectBody(res, customerListSchema);
    });

    it("supports search filter", async () => {
      const res = await client.get(
        `/api/customers?page=1&limit=5&search=${encodeURIComponent("Scenario")}`,
      );
      expectStatus(res, 200);
      expectBody(res, customerListSchema);
    });
  });

  describe("POST /api/customers", () => {
    it("creates customer with full profile", async () => {
      const payload = validCustomerPayload();
      const res = await client.post("/api/customers", payload);
      expectStatus(res, [200, 201]);
      const customer = expectBody(res, customerSchema);
      customerId = customer._id;
      expect(customer.firstName).toBe(payload.firstName);
      expect(customer.email).toBe(payload.email);
    });

    it("creates customer with only firstName (minimal)", async () => {
      const res = await client.post("/api/customers", {
        firstName: `Min-${uniqueSuffix()}`,
      });
      expectStatus(res, [200, 201]);
      const customer = expectBody(res, customerSchema);
      await client.delete(`/api/customers/${customer._id}`);
    });

    it("rejects invalid email with 400", async () => {
      const res = await client.post("/api/customers", {
        firstName: "Bad Email",
        email: "not-valid-email",
      });
      expectStatus(res, 400);
      nestErrorSchema.parse(res.data);
    });
  });

  describe("GET /api/customers/:id", () => {
    it("includes balance object on customer detail", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.get(`/api/customers/${customerId}`);
      expectStatus(res, 200);
      const customer = expectBody(res, customerWithBalanceSchema);
      expect(customer.balance).toBeDefined();
      expect(
        typeof customer.balance.netBalance === "number" ||
          typeof customer.balance.netBalance === "string",
      ).toBe(true);
      expect(customer.balance.direction.length).toBeGreaterThan(0);
    });

    it("returns 404 for unknown id", async () => {
      const res = await client.get(`/api/customers/${invalidMongoId}`);
      expectStatus(res, 404);
    });
  });

  describe("PATCH /api/customers/:id", () => {
    it("updates profile fields", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.patch(`/api/customers/${customerId}`, {
        city: "Karachi",
        state: "Sindh",
      });
      expectStatus(res, 200);
      const customer = expectBody(res, customerSchema);
      expect(customer.city).toBe("Karachi");
    });
  });

  describe("POST /api/customers/:id/balance-adjustments", () => {
    it("records customer_owes adjustment", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.post(
        `/api/customers/${customerId}/balance-adjustments`,
        { amount: 100, direction: "customer_owes", note: "scenario test" },
      );
      expectStatus(res, [200, 201]);
    });

    it("records we_owe_customer adjustment", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.post(
        `/api/customers/${customerId}/balance-adjustments`,
        { amount: 50, direction: "we_owe_customer" },
      );
      expectStatus(res, [200, 201]);
    });

    it("rejects negative amount", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.post(
        `/api/customers/${customerId}/balance-adjustments`,
        { amount: -10, direction: "customer_owes" },
      );
      expectStatus(res, 400);
    });
  });

  describe("GET nested customer resources", () => {
    it("returns customer orders (paginated)", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.get(
        `/api/customers/${customerId}/orders?page=1&limit=5`,
      );
      expectStatus(res, 200);
      expect(res.data).toHaveProperty("data");
      expect(res.data).toHaveProperty("pagination");
    });

    it("returns customer transactions (paginated)", async () => {
      expect(customerId).toBeTruthy();
      const res = await client.get(
        `/api/customers/${customerId}/transactions?page=1&limit=5`,
      );
      expectStatus(res, 200);
      expect(res.data).toHaveProperty("data");
    });
  });
});
