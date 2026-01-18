import { IconBoxSeam } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";

export default function StockPage() {
  return (
    <div>
      <SiteHeader title="Stock Management" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </h3>
                  <p className="mt-2 text-3xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">
                    Active products
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Low Stock Items
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-orange-600">23</p>
                  <p className="text-sm text-muted-foreground">
                    Need reordering
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">5</p>
                  <p className="text-sm text-muted-foreground">
                    Urgent attention
                  </p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Recent Stock Updates
                  </h2>
                  <div className="space-y-3">
                    {[
                      { item: "Product A", quantity: 150, status: "In Stock" },
                      { item: "Product B", quantity: 25, status: "Low Stock" },
                      {
                        item: "Product C",
                        quantity: 0,
                        status: "Out of Stock",
                      },
                      { item: "Product D", quantity: 300, status: "In Stock" },
                      { item: "Product E", quantity: 10, status: "Low Stock" },
                    ].map((stock, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{stock.item}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {stock.quantity}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            stock.status === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : stock.status === "Low Stock"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stock.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
