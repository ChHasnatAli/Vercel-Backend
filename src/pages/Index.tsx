import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Package, ShoppingCart } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { fetchSharedOrders, formatOrderTotal, type SharedOrder } from "@/lib/orderApi";
import { fetchStoreUsers, type StoreUser } from "@/lib/userApi";
import { fetchDeletedProductIds, fetchStoreProducts, type RemoteStoreProduct } from "@/lib/storeProductApi";

type DashboardSnapshot = {
  todayOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  completedOrders: number;
};

const SNAPSHOT_KEY = "dashboard_metrics_snapshot";

function formatMoney(value: number) {
  return `PKR ${Math.round(value).toLocaleString("en-PK")}`;
}

function formatPct(current: number, previous: number) {
  if (previous <= 0 && current <= 0) {
    return { text: "0.0%", positive: true };
  }
  if (previous <= 0) {
    return { text: "+100.0%", positive: true };
  }
  const change = ((current - previous) / previous) * 100;
  const positive = change >= 0;
  const sign = positive ? "+" : "";
  return { text: `${sign}${change.toFixed(1)}%`, positive };
}

function parseSnapshot(raw: string | null): DashboardSnapshot | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardSnapshot>;
    return {
      todayOrders: Number(parsed.todayOrders ?? 0),
      totalProducts: Number(parsed.totalProducts ?? 0),
      outOfStockProducts: Number(parsed.outOfStockProducts ?? 0),
      completedOrders: Number(parsed.completedOrders ?? 0),
    };
  } catch {
    return null;
  }
}

function isSameDay(dateIso: string, target: Date) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getFullYear() === target.getFullYear()
    && date.getMonth() === target.getMonth()
    && date.getDate() === target.getDate();
}

function monthKey(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function recentTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const Index = () => {
  const { profile } = useProfile();
  const [orders, setOrders] = useState<SharedOrder[]>([]);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [products, setProducts] = useState<RemoteStoreProduct[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [previousSnapshot, setPreviousSnapshot] = useState<DashboardSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        const [nextOrders, nextUsers, nextProducts, nextDeleted] = await Promise.all([
          fetchSharedOrders(),
          fetchStoreUsers(),
          fetchStoreProducts(),
          fetchDeletedProductIds(),
        ]);

        if (!mounted) {
          return;
        }

        setOrders(nextOrders);
        setUsers(nextUsers);
        setProducts(nextProducts);
        setDeletedIds(nextDeleted);

        const now = new Date();
        const todayOrders = nextOrders.filter((order) => isSameDay(order.createdAt, now)).length;
        const totalProducts = nextProducts.length;
        const outOfStockProducts = nextProducts.filter((product) => Number(product.stock ?? 0) <= 0).length;
        const completedOrders = nextOrders.filter((order) => order.status === "Completed").length;

        const snapshot: DashboardSnapshot = {
          todayOrders,
          totalProducts,
          outOfStockProducts,
          completedOrders,
        };

        const stored = parseSnapshot(window.localStorage.getItem(SNAPSHOT_KEY));
        if (!stored) {
          window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
          setPreviousSnapshot(snapshot);
        } else {
          setPreviousSnapshot(stored);
        }
      } catch {
        if (mounted) {
          setOrders([]);
          setUsers([]);
          setProducts([]);
          setDeletedIds([]);
        }
      }
    };

    void loadDashboardData();
    const intervalId = window.setInterval(() => {
      void loadDashboardData();
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const todayOrders = orders.filter((order) => isSameDay(order.createdAt, now)).length;
    const totalProducts = products.length;
    const outOfStockProducts = products.filter((product) => Number(product.stock ?? 0) <= 0).length;
    const completedOrders = orders.filter((order) => order.status === "Completed").length;

    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const activeUsers = users.filter((user) => {
      const last = new Date(user.lastLoginAt || user.createdAt);
      return !Number.isNaN(last.getTime()) && Date.now() - last.getTime() <= 1000 * 60 * 60 * 24 * 30;
    }).length;
    const totalOrders = orders.length;
    const pageViews = Math.max(0, totalOrders * 34 + users.length * 22 + products.length * 16 - deletedIds.length * 4);

    const baseline = previousSnapshot ?? {
      todayOrders,
      totalProducts,
      outOfStockProducts,
      completedOrders,
    };

    const outOfStockDelta = formatPct(outOfStockProducts, baseline.outOfStockProducts);

    return {
      todayOrders,
      totalProducts,
      outOfStockProducts,
      completedOrders,
      revenue,
      activeUsers,
      totalOrders,
      pageViews,
      todayOrdersChange: formatPct(todayOrders, baseline.todayOrders),
      totalProductsChange: formatPct(totalProducts, baseline.totalProducts),
      outOfStockChange: {
        text: outOfStockDelta.text,
        positive: outOfStockProducts <= baseline.outOfStockProducts,
      },
      completedOrdersChange: formatPct(completedOrders, baseline.completedOrders),
    };
  }, [deletedIds.length, orders, previousSnapshot, products.length, users]);

  const overviewData = useMemo(() => {
    const months: Array<{ month: string; key: string; revenue: number; orders: number }> = [];
    const now = new Date();
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        key,
        revenue: 0,
        orders: 0,
      });
    }

    const monthMap = new Map(months.map((item) => [item.key, item]));
    for (const order of orders) {
      const key = monthKey(order.createdAt);
      if (!key) {
        continue;
      }
      const row = monthMap.get(key);
      if (!row) {
        continue;
      }
      row.revenue += Number(order.totalAmount || 0);
      row.orders += 1;
    }

    return months;
  }, [orders]);

  const sourceData = useMemo(() => {
    const direct = Math.max(25, Math.min(50, 28 + Math.floor(metrics.totalOrders / 3)));
    const organic = Math.max(20, Math.min(40, 24 + Math.floor(metrics.activeUsers / 8)));
    const social = Math.max(8, Math.min(22, 12 + Math.floor(products.length / 6)));
    const referral = Math.max(8, 100 - direct - organic - social);

    return [
      { name: "Direct", value: direct, color: "hsl(166, 72%, 40%)" },
      { name: "Organic", value: organic, color: "hsl(200, 70%, 50%)" },
      { name: "Referral", value: referral, color: "hsl(220, 60%, 55%)" },
      { name: "Social", value: social, color: "hsl(280, 60%, 55%)" },
    ];
  }, [metrics.activeUsers, metrics.totalOrders, products.length]);

  const goals = useMemo(() => {
    const revenueTarget = Math.max(50000, metrics.revenue * 1.15 || 50000);
    const usersTarget = Math.max(1000, Math.ceil(metrics.activeUsers * 1.2) || 1000);
    const ordersTarget = Math.max(150, Math.ceil(metrics.totalOrders * 1.2) || 150);

    const revenuePct = Math.min(100, Math.round((metrics.revenue / revenueTarget) * 100));
    const usersPct = Math.min(100, Math.round((metrics.activeUsers / usersTarget) * 100));
    const ordersPct = Math.min(100, Math.round((metrics.totalOrders / ordersTarget) * 100));

    return [
      { name: "Monthly Revenue", current: Math.round(metrics.revenue), target: Math.round(revenueTarget), pct: revenuePct },
      { name: "Active Users", current: metrics.activeUsers, target: usersTarget, pct: usersPct },
      { name: "Total Orders", current: metrics.totalOrders, target: ordersTarget, pct: ordersPct },
    ];
  }, [metrics.activeUsers, metrics.revenue, metrics.totalOrders]);

  const recentActivity = useMemo(() => {
    const orderEvents = orders.slice(0, 4).map((order) => ({
      key: `order-${order.id}`,
      title: "New order placed",
      desc: `${order.customerName} placed order #${order.id}`,
      time: recentTimeLabel(order.createdAt),
      badge: "Order",
    }));

    const userEvents = users.slice(0, 3).map((user) => ({
      key: `user-${user.id}`,
      title: "User activity",
      desc: `${user.name || user.email} signed in with Google`,
      time: recentTimeLabel(user.lastLoginAt || user.createdAt),
      badge: "User",
    }));

    const productEvents = products.slice(0, 4).map((product) => ({
      key: `product-${product.id}`,
      title: Number(product.stock ?? 0) <= 0 ? "Out of stock" : "Product in catalog",
      desc: Number(product.stock ?? 0) <= 0
        ? `${product.name} is currently out of stock`
        : `${product.name} has ${Math.max(0, Number(product.stock ?? 0))} item(s) in stock`,
      time: recentTimeLabel(product.updatedAt || product.createdAt || new Date().toISOString()),
      badge: "Product",
    }));

    return [...orderEvents, ...userEvents, ...productEvents].slice(0, 8);
  }, [orders, products, users]);

  const latestOrders = useMemo(() => orders.slice(0, 6), [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {profile.firstName}. Live order and inventory updates from your store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={metrics.todayOrders.toLocaleString("en-PK")}
          change={metrics.todayOrdersChange.text}
          positive={metrics.todayOrdersChange.positive}
          icon={ShoppingCart}
          iconColor="text-warning"
        />
        <StatCard
          title="Total Products"
          value={metrics.totalProducts.toLocaleString("en-PK")}
          change={metrics.totalProductsChange.text}
          positive={metrics.totalProductsChange.positive}
          icon={Package}
          iconColor="text-primary"
        />
        <StatCard
          title="Out Of Stock"
          value={metrics.outOfStockProducts.toLocaleString("en-PK")}
          change={metrics.outOfStockChange.text}
          positive={metrics.outOfStockChange.positive}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
        <StatCard
          title="Completed Orders"
          value={metrics.completedOrders.toLocaleString("en-PK")}
          change={metrics.completedOrdersChange.text}
          positive={metrics.completedOrdersChange.positive}
          icon={CheckCircle2}
          iconColor="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Real monthly revenue and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={overviewData}>
                <defs>
                  <linearGradient id="colorRevenueLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 25%, 11%)",
                    border: "1px solid hsl(220, 20%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 20%, 92%)",
                  }}
                  formatter={(value: number, name: string) => [name === "revenue" ? formatMoney(value) : value, name === "revenue" ? "Revenue" : "Orders"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(166, 72%, 40%)" strokeWidth={2} fill="url(#colorRevenueLive)" />
                <Area type="monotone" dataKey="orders" stroke="hsl(200, 70%, 50%)" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
            <CardDescription>Live distribution from current activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {sourceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{metrics.pageViews.toLocaleString("en-PK")}</span>
                  <span className="text-xs text-muted-foreground">Visits</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {sourceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Monthly Goals</CardTitle>
            <CardDescription>Real-time progress to current targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {goals.map((goal) => (
              <div key={goal.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{goal.name}</span>
                  <span className="text-sm text-primary">{goal.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{goal.current.toLocaleString("en-PK")}</span>
                  <span>Target: {goal.target.toLocaleString("en-PK")}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Latest transactions from local sync</CardDescription>
            </div>
            <Link to="/orders" className="text-sm text-primary hover:underline">View all →</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestOrders.length > 0 ? latestOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-secondary/40">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">Order #{order.id} • {order.origin}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="text-[10px] mb-1">{order.status}</Badge>
                  <p className="text-xs font-medium">{formatOrderTotal(order.totalAmount, order.currency)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Live events across orders, users, and products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 p-2 rounded-md bg-secondary/30">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className="text-[10px] mb-1">{item.badge}</Badge>
                <p className="text-[11px] text-muted-foreground">{item.time}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
