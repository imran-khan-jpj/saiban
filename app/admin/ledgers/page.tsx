import { IconBook2 } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";

export default function LedgersPage() {
  return (
    <div>
      <SiteHeader title="Ledgers" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    $124,567
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +18% from last month
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    $45,890
                  </p>
                  <p className="text-sm text-muted-foreground">
                    -5% from last month
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    $78,677
                  </p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Outstanding
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    $12,340
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pending payments
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Recent Income
                    </h2>
                    <div className="space-y-3">
                      {[
                        {
                          description: "Product Sales",
                          amount: "+$12,450",
                          date: "Dec 27, 2025",
                          category: "Revenue",
                        },
                        {
                          description: "Service Income",
                          amount: "+$3,200",
                          date: "Dec 26, 2025",
                          category: "Revenue",
                        },
                        {
                          description: "Consultation Fee",
                          amount: "+$1,500",
                          date: "Dec 25, 2025",
                          category: "Revenue",
                        },
                        {
                          description: "Product Sales",
                          amount: "+$8,900",
                          date: "Dec 24, 2025",
                          category: "Revenue",
                        },
                      ].map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {entry.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.category}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Recent Expenses
                    </h2>
                    <div className="space-y-3">
                      {[
                        {
                          description: "Supplier Payment",
                          amount: "-$5,600",
                          date: "Dec 27, 2025",
                          category: "Expense",
                        },
                        {
                          description: "Rent",
                          amount: "-$2,500",
                          date: "Dec 26, 2025",
                          category: "Expense",
                        },
                        {
                          description: "Utilities",
                          amount: "-$890",
                          date: "Dec 25, 2025",
                          category: "Expense",
                        },
                        {
                          description: "Employee Salaries",
                          amount: "-$15,000",
                          date: "Dec 24, 2025",
                          category: "Expense",
                        },
                      ].map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">
                              {entry.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.category}
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
    </div>
  );
}
