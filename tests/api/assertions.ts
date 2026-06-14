import { expect } from "vitest";
import { z } from "zod";
import type { ApiResponse } from "./client";

export function expectStatus(
  res: ApiResponse,
  expected: number | readonly number[],
) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  expect(
    allowed,
    `Expected HTTP ${allowed.join("|")}, got ${res.status}: ${JSON.stringify(res.data).slice(0, 300)}`,
  ).toContain(res.status);
}

export function expectBody<T extends z.ZodType>(
  res: ApiResponse,
  schema: T,
): z.infer<T> {
  const parsed = schema.safeParse(res.data);
  expect(
    parsed.success,
    parsed.success
      ? ""
      : `Response body failed schema: ${parsed.error.message}`,
  ).toBe(true);
  return parsed.data!;
}

const mongoId = z.string().regex(/^[a-f0-9]{24}$/i);

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});

export const productSchema = z
  .object({
    _id: mongoId,
    name: z.string().min(1),
    unitPrice: z.union([z.number(), z.string()]),
    quantityInStock: z.number(),
    lowStockThreshold: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const productListSchema = z.object({
  data: z.array(productSchema),
  pagination: paginationSchema,
});

export const customerSchema = z
  .object({
    _id: mongoId,
    firstName: z.string().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const currencyAmount = z.union([z.number(), z.string()]);

export const customerWithBalanceSchema = customerSchema.extend({
  balance: z.object({
    netBalance: currencyAmount,
    direction: z.string(),
    absoluteAmount: currencyAmount,
  }),
});

export const customerListSchema = z.object({
  data: z.array(customerSchema),
  pagination: paginationSchema,
});

const customerRef = z.union([
  mongoId,
  z.null(),
  z.object({ _id: mongoId }).passthrough(),
]);

export const orderSchema = z
  .object({
    _id: mongoId,
    status: z.enum(["pending", "completed", "cancelled"]),
    customerId: customerRef.optional(),
    customer: customerRef.optional(),
    items: z.array(z.unknown()),
  })
  .passthrough();

export const orderListSchema = z.object({
  data: z.array(orderSchema),
  pagination: paginationSchema,
});

export const dashboardMetricsSchema = z.object({
  metrics: z.object({
    totalProducts: z.number(),
    totalCustomers: z.number(),
    totalOrders: z.number(),
    totalRevenue: z.union([z.string(), z.number()]),
    pendingPayments: z.union([z.string(), z.number()]),
    receivedPayments: z.union([z.string(), z.number()]),
  }),
  alerts: z.object({
    lowStockProducts: z.array(z.unknown()),
    pendingOrders: z.array(z.unknown()),
  }),
});

export const revenueTrendSchema = z.object({
  range: z.string(),
  granularity: z.enum(["day", "week"]),
  summary: z.object({
    totalRevenue: z.union([z.string(), z.number()]),
  }),
  series: z.array(
    z.object({
      bucketStart: z.string(),
      label: z.string(),
      revenue: z.union([z.string(), z.number()]),
    }),
  ),
});

export const ledgerListSchema = z.object({
  data: z.array(
    z
      .object({
        _id: mongoId,
        entryType: z.enum(["debit", "credit"]),
        amount: currencyAmount,
      })
      .passthrough(),
  ),
  pagination: paginationSchema,
});

export const nestErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  path: z.string().optional(),
});
