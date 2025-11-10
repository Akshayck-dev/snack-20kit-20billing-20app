import { useState, useMemo } from "react";
import { getSales } from "@/lib/storage";
import { TrendingUp, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const [viewType, setViewType] = useState<"daily" | "monthly">("daily");
  const sales = useMemo(() => getSales(), []);

  const getDateKey = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN");
  };

  const getMonthKey = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const dailyData = useMemo(() => {
    const grouped: Record<string, { revenue: number; qty: number; bakeries: Set<string> }> = {};

    sales.forEach((sale) => {
      const dateKey = getDateKey(sale.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = { revenue: 0, qty: 0, bakeries: new Set() };
      }
      grouped[dateKey].revenue += sale.totalAmount;
      grouped[dateKey].qty += sale.items.reduce((sum, item) => sum + item.qty, 0);
      grouped[dateKey].bakeries.add(sale.bakeryId);
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        qty: data.qty,
        bakeries: data.bakeries.size,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { revenue: number; qty: number; days: Set<string> }> = {};

    sales.forEach((sale) => {
      const monthKey = getMonthKey(sale.createdAt);
      const dateKey = getDateKey(sale.createdAt);
      if (!grouped[monthKey]) {
        grouped[monthKey] = { revenue: 0, qty: 0, days: new Set() };
      }
      grouped[monthKey].revenue += sale.totalAmount;
      grouped[monthKey].qty += sale.items.reduce((sum, item) => sum + item.qty, 0);
      grouped[monthKey].days.add(dateKey);
    });

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        qty: data.qty,
        days: data.days.size,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [sales]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQty = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">View your sales performance and trends.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">{sales.length} sales recorded</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Packets</p>
                <p className="text-3xl font-bold text-foreground mt-2">{totalQty}</p>
                <p className="text-xs text-muted-foreground mt-2">total quantity sold</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-border p-1">
          <button
            onClick={() => setViewType("daily")}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${
              viewType === "daily"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${
              viewType === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-foreground">
                  {viewType === "daily" ? "Date" : "Month"}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-foreground">Revenue</th>
                <th className="text-right px-6 py-3 font-semibold text-foreground">Packets</th>
                <th className="text-right px-6 py-3 font-semibold text-foreground">
                  {viewType === "daily" ? "Bakeries" : "Days"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(viewType === "daily" ? dailyData : monthlyData).length > 0 ? (
                (viewType === "daily" ? dailyData : monthlyData).map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {viewType === "daily" ? row.date : row.month}
                    </td>
                    <td className="text-right px-6 py-4 font-semibold text-primary">
                      ₹{row.revenue.toFixed(2)}
                    </td>
                    <td className="text-right px-6 py-4 text-foreground">{row.qty}</td>
                    <td className="text-right px-6 py-4 text-muted-foreground">
                      {viewType === "daily" ? row.bakeries : row.days}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Visual Chart (Simple Bar Chart) */}
        {(viewType === "daily" ? dailyData : monthlyData).length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6">Revenue Trend</h2>
            <div className="space-y-4">
              {(viewType === "daily" ? dailyData : monthlyData)
                .slice(0, 10)
                .map((row, idx) => {
                  const maxRevenue = Math.max(
                    ...(viewType === "daily" ? dailyData : monthlyData).map((d) => d.revenue)
                  );
                  const percentage = (row.revenue / maxRevenue) * 100;

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {viewType === "daily" ? row.date : row.month}
                        </span>
                        <span className="text-sm font-semibold text-primary">₹{row.revenue.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
