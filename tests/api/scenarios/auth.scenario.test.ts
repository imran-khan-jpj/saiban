import { describe, expect, it } from "vitest";
import { apiTestConfig } from "../config";
import { ApiClient, extractAuthToken } from "../client";
import { expectStatus, nestErrorSchema } from "../assertions";
import { describeApi } from "../helpers";

const { baseUrl, email, password, skip } = apiTestConfig;

describeApi("Auth API scenarios", () => {
  describe("POST /api/auth/login", () => {
    it("returns user and sets auth-token cookie on valid credentials", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(email);
      expect(extractAuthToken(res.headers)).toBeTruthy();
    });

    it("rejects invalid email format with 400", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email", password: "x" }),
      });
      expectStatus({ status: res.status, data: await res.json(), ok: false }, 400);
    });

    it("rejects wrong password with 401 or 400", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "wrong-password-xyz" }),
      });
      const data = await res.json();
      expect([400, 401]).toContain(res.status);
      nestErrorSchema.parse(data);
    });

    it("rejects missing password", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });

  describe("Protected proxy without session", () => {
    it("returns 401 when accessing /api/products without cookie", async () => {
      const res = await fetch(
        `${baseUrl}/api/proxy/api/products?page=1&limit=1`,
      );
      const data = await res.json();
      expect(res.status).toBe(401);
      nestErrorSchema.parse(data);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears session (returns 200)", async () => {
      if (skip) return;
      const client = await ApiClient.login();
      const res = await client.logout();
      expectStatus(res, 200);
    });
  });
});
