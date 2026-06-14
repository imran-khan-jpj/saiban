import { beforeAll, describe, expect, it } from "vitest";
import { ApiClient } from "../client";
import {
  dashboardMetricsSchema,
  expectBody,
  expectStatus,
  nestErrorSchema,
  revenueTrendSchema,
} from "../assertions";
import { describeApi } from "../helpers";

const REVENUE_RANGES = ["7d", "14d", "30d", "90d"] as const;

describeApi("Dashboard API scenarios", () => {
  let client: ApiClient;

  beforeAll(async () => {
    client = await ApiClient.login();
  }, 60_000);

  describe("GET /api/dashboard/metrics", () => {
    it("returns KPI metrics and alerts with expected shape", async () => {
      const res = await client.get("/api/dashboard/metrics");
      expectStatus(res, 200);
      const metrics = expectBody(res, dashboardMetricsSchema);
      expect(metrics.metrics.totalProducts).toBeGreaterThanOrEqual(0);
      expect(metrics.metrics.totalCustomers).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(metrics.alerts.lowStockProducts)).toBe(true);
      expect(Array.isArray(metrics.alerts.pendingOrders)).toBe(true);
    });
  });

  describe("GET /api/dashboard/revenue-trend", () => {
    it.each(REVENUE_RANGES)("returns valid series for range=%s", async (range) => {
      const res = await client.get(
        `/api/dashboard/revenue-trend?range=${range}`,
      );
      expectStatus(res, 200);
      const trend = expectBody(res, revenueTrendSchema);
      expect(trend.range).toBe(range);
      expect(trend.series.length).toBeGreaterThan(0);
      for (const point of trend.series) {
        expect(point.label.length).toBeGreaterThan(0);
        expect(point.bucketStart).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }
    });

    it("rejects invalid range with 400", async () => {
      const res = await client.get(
        "/api/dashboard/revenue-trend?range=invalid",
      );
      expectStatus(res, 400);
      nestErrorSchema.parse(res.data);
    });
  });
});
