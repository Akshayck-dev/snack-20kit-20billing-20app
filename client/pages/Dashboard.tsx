import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { getTodayStats, getTopItemsToday, getRecentlyUsedBakeries } from "@/lib/storage";
import { Bakery } from "@/lib/types";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalQty: 0, uniqueBakeries: 0 });
  const [topItems, setTopItems] = useState<{ name: string; qty: number }[]>([]);
  const [recentBakeries, setRecentBakeries] = useState<Bakery[]>([]);

  useEffect(() => {
    setStats(getTodayStats());
    setTopItems(getTopItemsToday());
    setRecentBakeries(getRecentlyUsedBakeries());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your sales summary for today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Quantity Card */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Quantity</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalQty}</p>
                <p className="text-xs text-muted-foreground mt-1">packets sold</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>

          {/* Bakeries Card */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Unique Bakeries</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.uniqueBakeries}</p>
                <p className="text-xs text-muted-foreground mt-1">served today</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Quick Add Sale
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Top Items Today</h2>
            {topItems.length > 0 ? (
              <div className="space-y-3">
                {topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{item.qty} pkt</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No sales yet today</p>
            )}
          </div>

          {/* Recent Bakeries */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Quick Access</h2>
            {recentBakeries.length > 0 ? (
              <div className="space-y-3">
                {recentBakeries.map((bakery) => (
                  <div key={bakery.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{bakery.name}</p>
                      <p className="text-xs text-muted-foreground">{bakery.phone}</p>
                    </div>
                    <Link
                      to="/sell"
                      className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Sell
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No recent bakeries</p>
            )}
            <Link
              to="/bakeries"
              className="block mt-4 text-center py-2 text-primary hover:bg-secondary/30 rounded-lg transition-colors text-sm font-semibold"
            >
              Manage Bakeries →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
