import { IconUsers } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";

export default function CustomersPage() {
  return (
    <div>
      <SiteHeader title="Customers" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </h3>
                  <p className="mt-2 text-3xl font-bold">2,847</p>
                  <p className="text-sm text-muted-foreground">
                    +12% from last month
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Active
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    2,456
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Currently active
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    New This Month
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">184</p>
                  <p className="text-sm text-muted-foreground">New signups</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Inactive
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-gray-600">391</p>
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Recent Customers
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        name: "John Doe",
                        email: "john@example.com",
                        joined: "2 days ago",
                        orders: 12,
                      },
                      {
                        name: "Jane Smith",
                        email: "jane@example.com",
                        joined: "5 days ago",
                        orders: 8,
                      },
                      {
                        name: "Mike Johnson",
                        email: "mike@example.com",
                        joined: "1 week ago",
                        orders: 15,
                      },
                      {
                        name: "Sarah Williams",
                        email: "sarah@example.com",
                        joined: "1 week ago",
                        orders: 5,
                      },
                      {
                        name: "Tom Brown",
                        email: "tom@example.com",
                        joined: "2 weeks ago",
                        orders: 20,
                      },
                    ].map((customer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {customer.orders} orders
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.joined}
                          </p>
                        </div>
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
