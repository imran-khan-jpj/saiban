import { apiTestConfig } from "./config";

const { runId } = apiTestConfig;

export function uniqueSuffix() {
  return `${runId}-${Date.now()}`;
}

export function validProductPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `Scenario Product ${uniqueSuffix()}`,
    shortDescription: "API scenario test",
    descriptionUrdu: "ٹیسٹ",
    formulation: "Tablet",
    packType: "Box",
    size: 10,
    unitPrice: 150.5,
    lowStockThreshold: 5,
    quantityInStock: 50,
    ...overrides,
  };
}

export function validCustomerPayload(overrides: Record<string, unknown> = {}) {
  const suffix = uniqueSuffix();
  return {
    firstName: "Scenario",
    lastName: `Customer-${suffix}`,
    phoneNumber: `+92300${String(Date.now()).slice(-7)}`,
    email: `scenario-${suffix}@api-test.local`,
    streetAddress: "123 Test Avenue",
    city: "Lahore",
    state: "Punjab",
    ...overrides,
  };
}

export function validOrderPayload(
  customerId: string,
  productId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    customerId,
    items: [{ productId, quantity: 2, discountPercentage: 10 }],
    note: `Scenario order ${uniqueSuffix()}`,
    ...overrides,
  };
}

export function validPaymentPayload(
  customerId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    customerId,
    amount: 25.5,
    paymentMethod: "cash",
    note: `Scenario payment ${uniqueSuffix()}`,
    ...overrides,
  };
}

export const invalidMongoId = "000000000000000000000000";
