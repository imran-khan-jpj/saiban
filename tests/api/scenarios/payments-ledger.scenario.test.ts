import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiClient, extractId } from "../client";
import {
  expectBody,
  expectStatus,
  ledgerListSchema,
  nestErrorSchema,
} from "../assertions";
import {
  invalidMongoId,
  validCustomerPayload,
  validOrderPayload,
  validPaymentPayload,
  validProductPayload,
} from "../fixtures";
import { describeApi } from "../helpers";

describeApi("Payments & Ledger API scenarios", () => {
  let client: ApiClient;
  let customerId: string;
  let productId: string;
  let confirmedOrderId: string | null = null;

  beforeAll(async () => {
    client = await ApiClient.login();
    const p = await client.post("/api/products", validProductPayload());
    productId = extractId(p.data)!;
    const c = await client.post("/api/customers", validCustomerPayload());
    customerId = extractId(c.data)!;
    const o = await client.post(
      "/api/orders",
      validOrderPayload(customerId, productId),
    );
    const orderId = extractId(o.data)!;
    await client.patch(`/api/orders/${orderId}/confirm`, {});
    confirmedOrderId = orderId;
  }, 90_000);

  afterAll(async () => {
    if (productId) await client.delete(`/api/products/${productId}`);
    if (customerId) await client.delete(`/api/customers/${customerId}`);
  });

  describe("POST /api/payment", () => {
    it("records payment linked to customer only", async () => {
      const res = await client.post(
        "/api/payment",
        validPaymentPayload(customerId),
      );
      expectStatus(res, [200, 201]);
      const data = res.data as Record<string, unknown>;
      expect(data.customerId ?? data._id).toBeTruthy();
    });

    it("records payment linked to order", async () => {
      expect(confirmedOrderId).toBeTruthy();
      const res = await client.post(
        "/api/payment",
        validPaymentPayload(customerId, { orderId: confirmedOrderId }),
      );
      expectStatus(res, [200, 201]);
    });

    it("accepts each valid paymentMethod", async () => {
      for (const method of [
        "cash",
        "jazzcash",
        "easypaisa",
        "bank_transfer",
      ] as const) {
        const res = await client.post(
          "/api/payment",
          validPaymentPayload(customerId, { paymentMethod: method, amount: 1 }),
        );
        expectStatus(res, [200, 201]);
      }
    });

    it("rejects missing customerId", async () => {
      const res = await client.post("/api/payment", {
        amount: 10,
        paymentMethod: "cash",
        note: "",
      });
      expectStatus(res, 400);
      nestErrorSchema.parse(res.data);
    });

    it("rejects zero amount", async () => {
      const res = await client.post(
        "/api/payment",
        validPaymentPayload(customerId, { amount: 0 }),
      );
      expectStatus(res, 400);
    });

    it("rejects invalid paymentMethod", async () => {
      const res = await client.post(
        "/api/payment",
        validPaymentPayload(customerId, { paymentMethod: "bitcoin" }),
      );
      expectStatus(res, 400);
    });
  });

  describe("GET /api/ledger/entries", () => {
    it("returns paginated ledger entries", async () => {
      const res = await client.get("/api/ledger/entries?page=1&limit=10");
      expectStatus(res, 200);
      expectBody(res, ledgerListSchema);
    });

    it("filters by customerId query param", async () => {
      const res = await client.get(
        `/api/ledger/entries?page=1&limit=10&customerId=${customerId}`,
      );
      expectStatus(res, 200);
      const list = expectBody(res, ledgerListSchema);
      for (const entry of list.data) {
        const entryCustomer =
          typeof entry.customerId === "string"
            ? entry.customerId
            : (entry.customerId as { _id?: string })?._id;
        if (entryCustomer) {
          expect(entryCustomer).toBe(customerId);
        }
      }
    });
  });

  describe("GET /api/ledger/customer/:id/entries", () => {
    it("returns customer-scoped ledger", async () => {
      const res = await client.get(
        `/api/ledger/customer/${customerId}/entries?page=1&limit=10`,
      );
      expectStatus(res, 200);
      expectBody(res, ledgerListSchema);
    });

    it("returns 404 or empty for invalid customer id", async () => {
      const res = await client.get(
        `/api/ledger/customer/${invalidMongoId}/entries?page=1&limit=5`,
      );
      expect([200, 404]).toContain(res.status);
    });
  });
});
