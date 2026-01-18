import { IconShoppingCart } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";

export default function OrdersPage() {
  return (
    <div>
      <SiteHeader title="Orders" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </h3>
                  <p className="mt-2 text-3xl font-bold">1,543</p>
                  <p className="text-sm text-muted-foreground">All time</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Pending
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-orange-600">47</p>
                  <p className="text-sm text-muted-foreground">
                    Awaiting processing
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Completed
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    1,428
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Successfully delivered
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Cancelled
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">68</p>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                  <div className="space-y-3">
                    {[
                      {
                        id: "ORD-1001",
                        customer: "John Doe",
                        amount: "$245.00",
                        status: "Pending",
                        date: "Today",
                      },
                      {
                        id: "ORD-1002",
                        customer: "Jane Smith",
                        amount: "$189.50",
                        status: "Completed",
                        date: "Today",
                      },
                      {
                        id: "ORD-1003",
                        customer: "Mike Johnson",
                        amount: "$567.25",
                        status: "Processing",
                        date: "Yesterday",
                      },
                      {
                        id: "ORD-1004",
                        customer: "Sarah Williams",
                        amount: "$89.99",
                        status: "Completed",
                        date: "Yesterday",
                      },
                      {
                        id: "ORD-1005",
                        customer: "Tom Brown",
                        amount: "$412.30",
                        status: "Shipped",
                        date: "2 days ago",
                      },
                    ].map((order, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{order.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.date}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Pending"
                              ? "bg-orange-100 text-orange-800"
                              : order.status === "Processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {order.status}
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
