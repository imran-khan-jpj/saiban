"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconPlus,
  IconTrash,
  IconCheck,
  IconSelector,
} from "@tabler/icons-react";
import { useGetAllCustomers } from "@/app/api/customers/use-get-all";
import { useGetAllProducts } from "@/app/api/products/use-get-all";

// Form validation schema
const orderFormSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  paymentMethod: z.enum(["cash", "on_account", "card"] as const),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be at least 0"),
        discountPercentage: z.number().min(0).max(100),
      }),
    )
    .min(1, "At least one item is required"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSubmit: (data: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      discountPercentage: number;
    }>;
    paymentMethod: string;
    note: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function OrderForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    trigger,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer: "",
      paymentMethod: "cash",
      note: "",
      items: [{ product: "", quantity: 1, price: 0, discountPercentage: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const selectedCustomer = watch("customer");
  const selectedPaymentMethod = watch("paymentMethod");
  const [customerOpen, setCustomerOpen] = React.useState(false);
  const [productOpenStates, setProductOpenStates] = React.useState<
    Record<number, boolean>
  >({});
  const [productChangeCounter, setProductChangeCounter] = React.useState(0);
  const [productStockLimits, setProductStockLimits] = React.useState<
    Record<number, number>
  >({});

  // Fetch customers and products
  const { data: customersData } = useGetAllCustomers(1, 100);
  const { data: productsData } = useGetAllProducts(1, 100);

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  // Calculate total amount with discounts
  const totalAmount = React.useMemo(() => {
    return items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      const discount = itemTotal * ((item.discountPercentage || 0) / 100);
      return sum + itemTotal - discount;
    }, 0);
  }, [items, productChangeCounter]);

  // Update price when product is selected
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setValue(`items.${index}.product`, productId, {
        shouldTouch: true,
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(`items.${index}.price`, product.unitPrice, {
        shouldTouch: true,
        shouldDirty: true,
        shouldValidate: true,
      });
      // Store stock limit for this item
      setProductStockLimits((prev) => ({
        ...prev,
        [index]: product.quantityInStock,
      }));
      // Reset quantity to 1 if it exceeds available stock
      if (items[index]?.quantity > product.quantityInStock) {
        setValue(
          `items.${index}.quantity`,
          Math.min(1, product.quantityInStock),
          {
            shouldTouch: true,
            shouldDirty: true,
            shouldValidate: true,
          },
        );
      }
      // Force re-render of total amount
      setProductChangeCounter((prev) => prev + 1);
    }
  };

  const handleFormSubmit = (data: OrderFormValues) => {
    // Transform data to match API payload structure
    const payload = {
      customerId: data.customer,
      items: data.items.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
        discountPercentage: item.discountPercentage,
      })),
      paymentMethod: data.paymentMethod,
      note: data.note || "",
    };
    onSubmit(payload as any);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={customerOpen}
              className={`w-full justify-between ${errors.customer ? "border-red-500" : ""}`}
            >
              {selectedCustomer
                ? customers.find((c) => c._id === selectedCustomer)
                  ? `${customers.find((c) => c._id === selectedCustomer)?.firstName} ${customers.find((c) => c._id === selectedCustomer)?.lastName}`
                  : "Select customer"
                : "Select customer"}
              <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search customer..." />
              <CommandList>
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer._id}
                      value={`${customer.firstName} ${customer.lastName} ${customer.email}`}
                      onSelect={() => {
                        setValue("customer", customer._id);
                        setCustomerOpen(false);
                      }}
                    >
                      <IconCheck
                        className={`mr-2 h-4 w-4 ${
                          selectedCustomer === customer._id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {customer.firstName} {customer.lastName} -{" "}
                      {customer.email}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.customer && (
          <p className="text-sm text-red-500">{errors.customer.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={selectedPaymentMethod}
          onValueChange={(value) => setValue("paymentMethod", value as any)}
        >
          <SelectTrigger
            id="paymentMethod"
            className={errors.paymentMethod ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="on_account">On Account</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Add any special instructions..."
          rows={3}
          {...register("note")}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Order Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                product: "",
                quantity: 1,
                price: 0,
                discountPercentage: 0,
              })
            }
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg"
          >
            <div className="col-span-4 space-y-2">
              <Label htmlFor={`items.${index}.product`}>Product</Label>
              <Popover
                open={productOpenStates[index] || false}
                onOpenChange={(open) =>
                  setProductOpenStates((prev) => ({ ...prev, [index]: open }))
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productOpenStates[index] || false}
                    className={`w-full justify-between ${
                      errors.items?.[index]?.product ? "border-red-500" : ""
                    }`}
                  >
                    {items[index]?.product
                      ? products.find((p) => p._id === items[index]?.product)
                          ?.name || "Select product"
                      : "Select product"}
                    <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter((product) => {
                            // Filter out products already selected in other items
                            const selectedProducts = items
                              .map((item, i) =>
                                i !== index ? item.product : null,
                              )
                              .filter(Boolean);
                            return !selectedProducts.includes(product._id);
                          })
                          .map((product) => (
                            <CommandItem
                              key={product._id}
                              value={`${product.name} ${product.unitPrice}`}
                              onSelect={() => {
                                handleProductChange(index, product._id);
                                setProductOpenStates((prev) => ({
                                  ...prev,
                                  [index]: false,
                                }));
                              }}
                              disabled={product.quantityInStock === 0}
                            >
                              <IconCheck
                                className={`mr-2 h-4 w-4 ${
                                  items[index]?.product === product._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div className="flex-1">
                                <div>
                                  {product.name} - PKR {product.unitPrice}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Stock: {product.quantityInStock}{" "}
                                  {product.quantityInStock === 0
                                    ? "(Out of stock)"
                                    : ""}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.items?.[index]?.product && (
                <p className="text-sm text-red-500">
                  {errors.items[index]?.product?.message}
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
              <Input
                id={`items.${index}.quantity`}
                type="number"
                placeholder="1"
                min="1"
                max={productStockLimits[index] || undefined}
                error={!!errors.items?.[index]?.quantity}
                errorMessage={errors.items?.[index]?.quantity?.message}
                {...register(`items.${index}.quantity`, {
                  valueAsNumber: true,
                  onChange: () => setProductChangeCounter((prev) => prev + 1),
                })}
              />
              {items[index]?.product &&
                productStockLimits[index] !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Max: {productStockLimits[index]} in stock
                    {items[index]?.quantity > productStockLimits[index] && (
                      <span className="text-destructive block">
                        Exceeds available stock!
                      </span>
                    )}
                  </p>
                )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor={`items.${index}.price`}>Price</Label>
              <Input
                id={`items.${index}.price`}
                type="number"
                placeholder="0"
                min="0"
                disabled
                error={!!errors.items?.[index]?.price}
                errorMessage={errors.items?.[index]?.price?.message}
                {...register(`items.${index}.price`, {
                  valueAsNumber: true,
                  onChange: () => setProductChangeCounter((prev) => prev + 1),
                })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor={`items.${index}.discountPercentage`}>
                Discount %
              </Label>
              <Input
                id={`items.${index}.discountPercentage`}
                type="number"
                placeholder="0"
                min="0"
                max="100"
                error={!!errors.items?.[index]?.discountPercentage}
                errorMessage={
                  errors.items?.[index]?.discountPercentage?.message
                }
                {...register(`items.${index}.discountPercentage`, {
                  valueAsNumber: true,
                  onChange: () => setProductChangeCounter((prev) => prev + 1),
                })}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between pt-7">
              <div className="text-sm font-medium">
                PKR{" "}
                {(
                  (items[index]?.quantity || 0) *
                  (items[index]?.price || 0) *
                  (1 - (items[index]?.discountPercentage || 0) / 100)
                ).toFixed(2)}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive h-8 w-8"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {errors.items?.root && (
          <p className="text-sm text-red-500">{errors.items.root.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <Label className="text-lg font-semibold">Total Amount</Label>
        <p className="text-lg font-bold">PKR {totalAmount.toFixed(2)}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4" />
              Creating...
            </span>
          ) : (
            <span>Create Order</span>
          )}
        </Button>
      </div>
    </form>
  );
}
