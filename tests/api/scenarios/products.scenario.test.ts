import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiClient, extractId } from "../client";
import {
  expectBody,
  expectStatus,
  nestErrorSchema,
  productListSchema,
  productSchema,
} from "../assertions";
import {
  invalidMongoId,
  uniqueSuffix,
  validProductPayload,
} from "../fixtures";
import { describeApi } from "../helpers";

describeApi("Products API scenarios", () => {
  let client: ApiClient;
  let createdProductId: string | null = null;
  const productName = `Scenario Product ${uniqueSuffix()}`;

  beforeAll(async () => {
    client = await ApiClient.login();
  }, 60_000);

  afterAll(async () => {
    if (createdProductId) {
      await client.delete(`/api/products/${createdProductId}`);
    }
  });

  describe("GET /api/products", () => {
    it("returns paginated list with valid schema", async () => {
      const res = await client.get("/api/products?page=1&limit=5");
      expectStatus(res, 200);
      const list = expectBody(res, productListSchema);
      expect(list.data.length).toBeLessThanOrEqual(5);
      expect(list.pagination.page).toBe(1);
    });

    it("supports search query param", async () => {
      const res = await client.get(
        `/api/products?page=1&limit=5&search=${encodeURIComponent("a")}`,
      );
      expectStatus(res, 200);
      expectBody(res, productListSchema);
    });

    it("supports stockStatus=low_stock filter", async () => {
      const res = await client.get(
        "/api/products?page=1&limit=5&stockStatus=low_stock",
      );
      expectStatus(res, 200);
      expectBody(res, productListSchema);
    });
  });

  describe("POST /api/products", () => {
    it("creates product and returns persisted fields", async () => {
      const payload = validProductPayload({ name: productName });
      const res = await client.post("/api/products", payload);
      expectStatus(res, [200, 201]);
      const product = expectBody(res, productSchema);
      createdProductId = product._id;
      expect(product.name).toBe(productName);
      expect(product.quantityInStock).toBe(payload.quantityInStock);
    });

    it("rejects missing required name with 400", async () => {
      const res = await client.post("/api/products", {
        unitPrice: 10,
        quantityInStock: 1,
      });
      expectStatus(res, 400);
      nestErrorSchema.parse(res.data);
    });

    it("rejects negative unitPrice with 400", async () => {
      const res = await client.post(
        "/api/products",
        validProductPayload({ unitPrice: -5 }),
      );
      expectStatus(res, 400);
    });
  });

  describe("GET /api/products/:id", () => {
    it("returns created product by id", async () => {
      expect(createdProductId).toBeTruthy();
      const res = await client.get(`/api/products/${createdProductId}`);
      expectStatus(res, 200);
      const product = expectBody(res, productSchema);
      expect(product._id).toBe(createdProductId);
      expect(product.name).toBe(productName);
    });

    it("returns 404 for non-existent id", async () => {
      const res = await client.get(`/api/products/${invalidMongoId}`);
      expectStatus(res, 404);
      nestErrorSchema.parse(res.data);
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("updates fields and returns updated document", async () => {
      expect(createdProductId).toBeTruthy();
      const updatedName = `Updated ${productName}`;
      const res = await client.patch(`/api/products/${createdProductId}`, {
        ...validProductPayload(),
        name: updatedName,
        unitPrice: 199.99,
        quantityInStock: 75,
      });
      expectStatus(res, 200);
      const product = expectBody(res, productSchema);
      expect(product.name).toBe(updatedName);
      expect(Number(product.unitPrice)).toBe(199.99);
      expect(product.quantityInStock).toBe(75);
    });

    it("returns 404 when updating non-existent product", async () => {
      const res = await client.patch(`/api/products/${invalidMongoId}`, {
        ...validProductPayload(),
      });
      expectStatus(res, 404);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("deletes product then GET returns 404", async () => {
      const createRes = await client.post(
        "/api/products",
        validProductPayload({ name: `Delete-me ${uniqueSuffix()}` }),
      );
      const id = extractId(createRes.data);
      expect(id).toBeTruthy();

      const delRes = await client.delete(`/api/products/${id}`);
      expectStatus(delRes, [200, 204]);

      const getRes = await client.get(`/api/products/${id}`);
      expectStatus(getRes, 404);
    });
  });
});
