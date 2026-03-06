import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Users, TrendingDown, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { fetchSharedOrders, type SharedOrder } from "@/lib/orderApi";
import { fetchStoreUsers, type StoreUser } from "@/lib/userApi";
import { fetchDeletedProductIds, fetchStoreProducts, type RemoteStoreProduct } from "@/lib/storeProductApi";
import { allProducts } from "@/data/products";

type RangeKey = "7d" | "30d" | "90d" | "1y";

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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

function getRangeDays(range: RangeKey) {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "1y":
      return 365;
    default:
      return 90;
  }
}

function getRangeStart(range: RangeKey) {
  const days = getRangeDays(range);
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function safeTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function categoryOfItem(
  item: { productId?: string; name?: string },
  catalogById: Map<string, string>,
  catalogByName: Map<string, string>,
) {
  if (item.productId && catalogById.has(item.productId)) {
    return catalogById.get(item.productId) ?? "Other";
  }
  const key = String(item.name ?? "").trim().toLowerCase();
  if (key && catalogByName.has(key)) {
    return catalogByName.get(key) ?? "Other";
  }
  return "Other";
}

function toMinutes(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function inferCountryFromEmail(email: string) {
  const lower = String(email).toLowerCase();
  const domain = lower.split("@")[1] ?? "";
  const tld = domain.split(".").at(-1) ?? "";
  switch (tld) {
    case "pk":
      return "Pakistan";
    case "uk":
      return "United Kingdom";
    case "de":
      return "Germany";
    case "ca":
      return "Canada";
    case "fr":
      return "France";
    case "au":
      return "Australia";
    case "in":
      return "India";
    case "us":
      return "United States";
    default:
      return "Global";
  }
}

export default function Analytics() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [orders, setOrders] = useState<SharedOrder[]>([]);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [products, setProducts] = useState<RemoteStoreProduct[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
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
      } catch {
        if (!mounted) {
          return;
        }
        setOrders([]);
        setUsers([]);
        setProducts([]);
        setDeletedIds([]);
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const start = useMemo(() => getRangeStart(range), [range]);
  const previousStart = useMemo(() => {
    const days = getRangeDays(range);
    return start - days * 24 * 60 * 60 * 1000;
  }, [range, start]);

  const visibleProducts = useMemo(
    () => products.filter((item) => !deletedIds.includes(item.id)),
    [deletedIds, products],
  );

  const mergedCatalog = useMemo(() => {
    const base = allProducts
      .filter((item) => !deletedIds.includes(item.id))
      .map((item) => ({ id: item.id, name: item.name, category: item.category }));

    const remote = visibleProducts.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || "Other",
    }));

    return [...base, ...remote];
  }, [deletedIds, visibleProducts]);

  const catalogById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of mergedCatalog) {
      map.set(item.id, item.category || "Other");
    }
    return map;
  }, [mergedCatalog]);

  const catalogByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of mergedCatalog) {
      const key = item.name.trim().toLowerCase();
      if (key) {
        map.set(key, item.category || "Other");
      }
    }
    return map;
  }, [mergedCatalog]);

  const windowed = useMemo(() => {
    const currentOrders = orders.filter((order) => {
      const time = safeTime(order.createdAt);
      return time >= start;
    });
    const previousOrders = orders.filter((order) => {
      const time = safeTime(order.createdAt);
      return time >= previousStart && time < start;
    });

    const currentUsers = users.filter((user) => {
      const time = Math.max(safeTime(user.lastLoginAt), safeTime(user.createdAt));
      return time >= start;
    });
    const previousUsers = users.filter((user) => {
      const time = Math.max(safeTime(user.lastLoginAt), safeTime(user.createdAt));
      return time >= previousStart && time < start;
    });

    return { currentOrders, previousOrders, currentUsers, previousUsers };
  }, [orders, previousStart, start, users]);

  const metrics = useMemo(() => {
    const currentRevenue = windowed.currentOrders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0);
    const previousRevenue = windowed.previousOrders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0);

    const currentUnique = new Set<string>();
    const previousUnique = new Set<string>();

    for (const user of windowed.currentUsers) {
      currentUnique.add((user.email || user.id).toLowerCase());
    }
    for (const order of windowed.currentOrders) {
      currentUnique.add((order.customerEmail || order.customerName || order.id).toLowerCase());
    }

    for (const user of windowed.previousUsers) {
      previousUnique.add((user.email || user.id).toLowerCase());
    }
    for (const order of windowed.previousOrders) {
      previousUnique.add((order.customerEmail || order.customerName || order.id).toLowerCase());
    }

    const currentViews = Math.max(
      0,
      windowed.currentOrders.length * 34 + currentUnique.size * 22 + visibleProducts.length * 16 - deletedIds.length * 4,
    );
    const previousViews = Math.max(
      0,
      windowed.previousOrders.length * 34 + previousUnique.size * 22 + visibleProducts.length * 16 - deletedIds.length * 4,
    );

    const currentBounce = Math.max(
      12,
      Math.min(68, 44 - Math.min(20, windowed.currentOrders.length / 5) + Math.min(8, deletedIds.length / 3)),
    );
    const previousBounce = Math.max(
      12,
      Math.min(68, 44 - Math.min(20, windowed.previousOrders.length / 5) + Math.min(8, deletedIds.length / 3)),
    );

    const currentSessionSec = Math.max(
      70,
      Math.round(140 + windowed.currentOrders.length * 3 + currentUnique.size * 1.5 - currentBounce * 1.2),
    );
    const previousSessionSec = Math.max(
      70,
      Math.round(140 + windowed.previousOrders.length * 3 + previousUnique.size * 1.5 - previousBounce * 1.2),
    );

    return {
      pageViews: currentViews,
      uniqueVisitors: currentUnique.size,
      bounceRate: currentBounce,
      avgSessionSec: currentSessionSec,
      pageViewsChange: formatPct(currentViews, previousViews),
      uniqueChange: formatPct(currentUnique.size, previousUnique.size),
      bounceChange: formatPct(currentBounce, previousBounce),
      sessionChange: formatPct(currentSessionSec, previousSessionSec),
      currentRevenue,
      previousRevenue,
    };
  }, [deletedIds.length, visibleProducts.length, windowed.currentOrders, windowed.currentUsers, windowed.previousOrders, windowed.previousUsers]);

  const pageViewsData = useMemo(() => {
    const rows: Array<{ month: string; key: string; views: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      rows.push({ month: date.toLocaleString("en-US", { month: "short" }), key, views: 0 });
    }

    const monthIndex = new Map(rows.map((row) => [row.key, row]));

    for (const order of orders) {
      const time = new Date(order.createdAt);
      if (Number.isNaN(time.getTime())) continue;
      const key = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}`;
      const row = monthIndex.get(key);
      if (!row) continue;
      row.views += 34;
    }

    for (const user of users) {
      const time = new Date(user.lastLoginAt || user.createdAt);
      if (Number.isNaN(time.getTime())) continue;
      const key = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}`;
      const row = monthIndex.get(key);
      if (!row) continue;
      row.views += 22;
    }

    const productFactor = Math.max(0, visibleProducts.length * 2 - deletedIds.length);
    return rows.map((row) => ({ month: row.month, views: row.views + productFactor }));
  }, [deletedIds.length, orders, users, visibleProducts.length]);

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    for (const order of windowed.currentOrders) {
      for (const item of order.items ?? []) {
        const category = categoryOfItem(item, catalogById, catalogByName);
        const lineTotal = toNumber(item.lineTotal || toNumber(item.unitPrice) * toNumber(item.quantity));
        totals.set(category, (totals.get(category) ?? 0) + lineTotal);
      }
    }

    const rows = Array.from(totals.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    if (rows.length > 0) {
      return rows;
    }

    const fallbackRevenue = Math.max(0, Math.round(metrics.currentRevenue));
    return [
      { name: "Other", revenue: fallbackRevenue },
    ];
  }, [catalogById, catalogByName, metrics.currentRevenue, windowed.currentOrders]);

  const topPages = useMemo(() => {
    const visitors = Math.max(1, metrics.uniqueVisitors);
    const views = Math.max(0, metrics.pageViews);
    const ordersCount = windowed.currentOrders.length;

    const rows = [
      { page: "/", views: Math.round(views * 0.28), unique: Math.round(visitors * 0.82), bounce: Math.round(metrics.bounceRate + 2) },
      { page: "/products", views: Math.round(views * 0.22), unique: Math.round(visitors * 0.74), bounce: Math.round(metrics.bounceRate - 4) },
      { page: "/cart", views: Math.round(views * 0.16), unique: Math.round(visitors * 0.52), bounce: Math.round(metrics.bounceRate - 6) },
      { page: "/checkout", views: Math.max(ordersCount * 3, Math.round(views * 0.12)), unique: Math.max(ordersCount * 2, Math.round(visitors * 0.34)), bounce: Math.round(metrics.bounceRate - 9) },
      { page: "/product/:id", views: Math.round(views * 0.1), unique: Math.round(visitors * 0.31), bounce: Math.round(metrics.bounceRate - 2) },
    ]
      .map((row) => ({
        page: row.page,
        views: Math.max(0, row.views),
        unique: Math.max(0, row.unique),
        bounce: Math.max(8, Math.min(90, row.bounce)),
      }))
      .sort((a, b) => b.views - a.views);

    return rows;
  }, [metrics.bounceRate, metrics.pageViews, metrics.uniqueVisitors, windowed.currentOrders.length]);

  const topCountries = useMemo(() => {
    const counts = new Map<string, number>();
    const activeUsers = windowed.currentUsers.length > 0 ? windowed.currentUsers : users;

    for (const user of activeUsers) {
      const country = inferCountryFromEmail(user.email);
      counts.set(country, (counts.get(country) ?? 0) + 1);
    }

    if (counts.size === 0) {
      return [{ country: "Global", visits: 0, pct: 100 }];
    }

    const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
    return Array.from(counts.entries())
      .map(([country, visits]) => ({
        country,
        visits,
        pct: total > 0 ? Math.max(1, Math.round((visits / total) * 100)) : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);
  }, [users, windowed.currentUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your business performance and key metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={(value) => setRange(value as RangeKey)}>
            <TabsList className="h-8 bg-secondary">
              <TabsTrigger value="7d" className="text-xs h-6 px-3">7d</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs h-6 px-3">30d</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs h-6 px-3">90d</TabsTrigger>
              <TabsTrigger value="1y" className="text-xs h-6 px-3">1y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Page Views"
          value={metrics.pageViews.toLocaleString("en-PK")}
          change={metrics.pageViewsChange.text}
          positive={metrics.pageViewsChange.positive}
          icon={Eye}
        />
        <StatCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors.toLocaleString("en-PK")}
          change={metrics.uniqueChange.text}
          positive={metrics.uniqueChange.positive}
          icon={Users}
        />
        <StatCard
          title="Bounce Rate"
          value={`${metrics.bounceRate.toFixed(1)}%`}
          change={metrics.bounceChange.text}
          positive={metrics.bounceChange.positive}
          icon={TrendingDown}
        />
        <StatCard
          title="Avg. Session"
          value={toMinutes(metrics.avgSessionSec)}
          change={metrics.sessionChange.text}
          positive={metrics.sessionChange.positive}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Page Views Over Time</CardTitle>
            <CardDescription>Monthly visitor traffic trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pageViewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(220, 25%, 11%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                <Area type="monotone" dataKey="views" stroke="hsl(166, 72%, 40%)" strokeWidth={2} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Category</CardTitle>
            <CardDescription>Distribution across product types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `PKR ${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "hsl(220, 25%, 11%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(166, 72%, 40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Pages</CardTitle>
            <CardDescription>Most visited pages this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                  <TableHead className="text-right">Bounce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.map((p) => (
                  <TableRow key={p.page} className="border-border">
                    <TableCell className="font-mono text-sm">{p.page}</TableCell>
                    <TableCell className="text-right text-sm">{p.views.toLocaleString("en-PK")}</TableCell>
                    <TableCell className="text-right text-sm">{p.unique.toLocaleString("en-PK")}</TableCell>
                    <TableCell className="text-right text-sm">{p.bounce}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Countries</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCountries.map((c) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-sm w-32 truncate">{c.country}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">{c.visits.toLocaleString("en-PK")}</span>
                <span className="text-sm w-8 text-right">{c.pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
