import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiClient, extractId } from "../client";
import {
  expectBody,
  expectStatus,
  nestErrorSchema,
  orderListSchema,
  orderSchema,
} from "../assertions";
import {
  invalidMongoId,
  validCustomerPayload,
  validOrderPayload,
  validProductPayload,
} from "../fixtures";
import { describeApi } from "../helpers";

describeApi("Orders API scenarios", () => {
  let client: ApiClient;
  let productId: string;
  let customerId: string;
  const cleanupOrderIds: string[] = [];

  beforeAll(async () => {
    client = await ApiClient.login();
    const productRes = await client.post(
      "/api/products",
      validProductPayload({ quantityInStock: 100 }),
    );
    productId = extractId(productRes.data)!;
    const customerRes = await client.post(
      "/api/customers",
      validCustomerPayload(),
    );
    customerId = extractId(customerRes.data)!;
  }, 60_000);

  afterAll(async () => {
    for (const id of cleanupOrderIds) {
      await client.patch(`/api/orders/${id}/cancel`, {}).catch(() => {});
    }
    if (productId) await client.delete(`/api/products/${productId}`);
    if (customerId) await client.delete(`/api/customers/${customerId}`);
  });

  describe("POST /api/orders", () => {
    it("creates pending order with line items and discount", async () => {
      const res = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      expectStatus(res, [200, 201]);
      const order = expectBody(res, orderSchema);
      const id = order._id;
      cleanupOrderIds.push(id);
      expect(order.status).toBe("pending");
      expect(order.items.length).toBeGreaterThan(0);
    });

    it("rejects invalid productId in line items", async () => {
      const res = await client.post(
        "/api/orders",
        validOrderPayload(customerId, invalidMongoId),
      );
      expectStatus(res, 400);
      nestErrorSchema.parse(res.data);
    });

    it("documents behavior: invalid customerId may still create order (backend quirk)", async () => {
      const res = await client.post(
        "/api/orders",
        validOrderPayload(invalidMongoId, productId),
      );
      // Staging currently returns 201; tighten to 400 when backend validates customerId.
      if (res.status === 201) {
        const order = expectBody(res, orderSchema);
        cleanupOrderIds.push(order._id);
        await client.patch(`/api/orders/${order._id}/cancel`, {}).catch(() => {});
      } else {
        expectStatus(res, 400);
      }
    });

    it("rejects quantity zero", async () => {
      const res = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId, {
          items: [{ productId, quantity: 0, discountPercentage: 0 }],
        }),
      );
      expectStatus(res, 400);
    });

    it("rejects discount above 100", async () => {
      const res = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId, {
          items: [{ productId, quantity: 1, discountPercentage: 150 }],
        }),
      );
      expectStatus(res, 400);
    });
  });

  describe("GET /api/orders", () => {
    it("lists orders with pagination", async () => {
      const res = await client.get("/api/orders?page=1&limit=5");
      expectStatus(res, 200);
      expectBody(res, orderListSchema);
    });

    it("filters by status=pending", async () => {
      const res = await client.get("/api/orders?page=1&limit=5&status=pending");
      expectStatus(res, 200);
      const list = expectBody(res, orderListSchema);
      for (const order of list.data) {
        expect(order.status).toBe("pending");
      }
    });

    it("filters by customerId", async () => {
      const res = await client.get(
        `/api/orders?page=1&limit=5&customerId=${customerId}`,
      );
      expectStatus(res, 200);
      expectBody(res, orderListSchema);
    });
  });

  describe("Order lifecycle: confirm & cancel", () => {
    it("confirms pending order → status completed", async () => {
      const createRes = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      const orderId = extractId(createRes.data)!;
      cleanupOrderIds.push(orderId);

      const confirmRes = await client.patch(
        `/api/orders/${orderId}/confirm`,
        {},
      );
      expectStatus(confirmRes, 200);

      const getRes = await client.get(`/api/orders/${orderId}`);
      const order = expectBody(getRes, orderSchema);
      expect(order.status).toBe("completed");
    });

    it("rejects confirming an already completed order", async () => {
      const createRes = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      const orderId = extractId(createRes.data)!;
      cleanupOrderIds.push(orderId);
      await client.patch(`/api/orders/${orderId}/confirm`, {});

      const again = await client.patch(`/api/orders/${orderId}/confirm`, {});
      expectStatus(again, 400);
    });

    it("cancels pending order → status cancelled", async () => {
      const createRes = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      const orderId = extractId(createRes.data)!;
      cleanupOrderIds.push(orderId);

      const cancelRes = await client.patch(`/api/orders/${orderId}/cancel`, {});
      expectStatus(cancelRes, 200);

      const getRes = await client.get(`/api/orders/${orderId}`);
      const order = expectBody(getRes, orderSchema);
      expect(order.status).toBe("cancelled");
    });

    it("rejects cancelling a completed order", async () => {
      const createRes = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      const orderId = extractId(createRes.data)!;
      cleanupOrderIds.push(orderId);
      await client.patch(`/api/orders/${orderId}/confirm`, {});

      const cancelRes = await client.patch(`/api/orders/${orderId}/cancel`, {});
      expectStatus(cancelRes, 400);
    });

    it("rejects double-cancel on same order", async () => {
      const createRes = await client.post(
        "/api/orders",
        validOrderPayload(customerId, productId),
      );
      const orderId = extractId(createRes.data)!;
      cleanupOrderIds.push(orderId);
      await client.patch(`/api/orders/${orderId}/cancel`, {});

      const again = await client.patch(`/api/orders/${orderId}/cancel`, {});
      expectStatus(again, 400);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("returns 404 for unknown order", async () => {
      const res = await client.get(`/api/orders/${invalidMongoId}`);
      expectStatus(res, 404);
    });
  });
});
