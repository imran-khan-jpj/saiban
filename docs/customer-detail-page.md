# Customer Detail Page - Implementation Guide

## Page Route

`/admin/customers/:id`

## Overview

The customer detail page provides a comprehensive view of a single customer's information, financial status, and transaction/order history.

## Current Structure

### 1. **Customer Summary Cards** (Top Section)

- **Current Balance**: Shows the outstanding balance (receivable) for the customer
- **Total Orders**: Count of all orders placed by the customer
- **Total Spent**: Sum of all order amounts
- **Total Paid**: Sum of all payments received from the customer

### 2. **Tab Sections**

#### Tab 1: Overview

- Display customer's basic information:
  - Full Name
  - Email Address
  - Phone Number
  - Complete Address (Street, City, State)
  - Registration Date

#### Tab 2: Record Payment

**Purpose**: Add new payment records for this customer

**Required Fields**:

- Amount (PKR)
- Payment Method (Cash, Bank Transfer, Check, etc.)
- Payment Date
- Reference Number (optional)
- Notes/Description (optional)

**API Integration Needed**:

- Endpoint to record payment against customer ID
- This should update the ledger entries
- Should reduce the customer's outstanding balance

#### Tab 3: Transaction History

**Purpose**: View complete financial transaction history

**Should Display**:

- Date of transaction
- Transaction type (Order, Payment, Credit, Debit)
- Amount
- Running balance
- Description/Notes
- Related order ID (if applicable)

**API Integration Needed**:

- Fetch ledger entries for this customer
- Endpoint: `/api/ledger/entries?customerId={id}`
- Should support pagination and date filtering

#### Tab 4: Order History

**Purpose**: View all orders placed by this customer

**Should Display**:

- Order ID
- Order Date
- Items count
- Total Amount
- Status (Pending, Confirmed, Completed, Cancelled)
- Payment Status
- Action buttons (View Order Details)

**API Integration Needed**:

- Fetch orders filtered by customer ID
- Endpoint: `/api/orders?customerId={id}`
- Should support pagination

## APIs to Implement

### 1. Get Customer by ID

```typescript
GET /api/customers/:id
Response: {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Get Customer Balance

```typescript
GET /api/customers/:id/balance
Response: {
  currentBalance: number;
  totalOrders: number;
  totalSpent: number;
  totalPaid: number;
}
```

### 3. Record Payment

```typescript
POST /api/ledger/payment
Body: {
  customerId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}
```

### 4. Get Customer Transactions

```typescript
GET /api/ledger/entries?customerId={id}&page={page}&limit={limit}
Response: {
  data: Array<{
    _id: string;
    type: 'debit' | 'credit';
    amount: number;
    balance: number;
    description: string;
    orderId?: string;
    createdAt: string;
  }>;
  pagination: { page, limit, total, pages };
}
```

### 5. Get Customer Orders

```typescript
GET /api/orders?customerId={id}&page={page}&limit={limit}
Response: {
  data: Array<Order>;
  pagination: { page, limit, total, pages };
}
```

## Implementation Steps

1. **Create API hooks** in `/app/api/customers/`:
   - `use-get-by-id.ts`
   - `use-get-balance.ts`
   - `use-record-payment.ts`

2. **Update customer-detail.tsx**:
   - Replace placeholder data with actual API calls
   - Implement payment form
   - Add transaction history table
   - Add order history table

3. **Create payment form component**:
   - `/components/admin/customers/payment-form.tsx`
   - Include validation
   - Handle submission

4. **Test the complete flow**:
   - Navigate from customers list to detail page
   - View customer information
   - Record a payment
   - Verify transaction history updates
   - Check order history displays correctly

## UI Components Needed

- Payment form with validation
- Transaction history table with date filters
- Order history table
- Loading states for all data fetching
- Error handling for API failures

## Notes

- The page is already structured with tabs for easy navigation
- Customer rows in the main table are clickable and will navigate to this page
- Back button is implemented to return to customers list
- The layout is responsive and handles different screen sizes
