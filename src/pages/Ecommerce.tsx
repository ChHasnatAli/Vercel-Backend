import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, CheckSquare, TrendingUp, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";

const salesData = [
  { day: "Feb 1", revenue: 2800 }, { day: "Feb 6", revenue: 3200 }, { day: "Feb 11", revenue: 3800 },
  { day: "Feb 16", revenue: 3500 }, { day: "Feb 21", revenue: 4200 }, { day: "Feb 26", revenue: 4800 },
];

const orderStatusData = [
  { name: "Completed", value: 584, color: "hsl(152, 60%, 42%)" },
  { name: "Processing", value: 234, color: "hsl(200, 70%, 50%)" },
  { name: "Pending", value: 127, color: "hsl(220, 60%, 55%)" },
  { name: "Cancelled", value: 47, color: "hsl(38, 92%, 50%)" },
];

const topProducts = [
  { rank: 1, name: "Ashwagandha Capsules", category: "Supplements", sold: 342, revenue: "PKR 6,846" },
  { rank: 2, name: "Shilajit Resin", category: "Herbs", sold: 156, revenue: "PKR 6,232" },
  { rank: 3, name: "Green Tea (Loose Leaf)", category: "Teas", sold: 289, revenue: "PKR 3,612" },
  { rank: 4, name: "Hibiscus Tea", category: "Teas", sold: 134, revenue: "PKR 1,474" },
  { rank: 5, name: "Amla Oil", category: "Oils", sold: 421, revenue: "PKR 7,052" },
];

const categoryRevenue = [
  { name: "Supplements", revenue: 22500 },
  { name: "Herbs", revenue: 18200 },
  { name: "Teas", revenue: 14800 },
  { name: "Oils", revenue: 9600 },
];

export default function Ecommerce() {
  const totalOrders = orderStatusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">eCommerce</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your sales performance and commerce metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value="PKR 128,430" change="+18.2%" positive icon={DollarSign} />
        <StatCard title="Avg Order Value" value="PKR 64.50" change="+4.8%" positive icon={CheckSquare} iconColor="text-info" />
        <StatCard title="Conversion Rate" value="3.24%" change="+0.8%" positive icon={TrendingUp} iconColor="text-warning" />
        <StatCard title="Refund Rate" value="2.1%" change="-0.3%" positive={false} icon={RefreshCw} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Sales Overview</CardTitle>
              <CardDescription>Daily performance for the current month</CardDescription>
            </div>
            <Tabs defaultValue="revenue">
              <TabsList className="h-8 bg-secondary">
                <TabsTrigger value="revenue" className="text-xs h-6 px-3">Revenue</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs h-6 px-3">Orders</TabsTrigger>
                <TabsTrigger value="profit" className="text-xs h-6 px-3">Profit</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `PKR ${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ background: "hsl(220, 25%, 11%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(166, 72%, 40%)" strokeWidth={2} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
            <CardDescription>Distribution of current orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" strokeWidth={0}>
                      {orderStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{totalOrders}</span>
                  <span className="text-xs text-muted-foreground">Orders</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {orderStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Selling Products</CardTitle>
              <CardDescription>Best performers this month</CardDescription>
            </div>
            <Link to="/products" className="text-sm text-primary hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.rank} className="border-border">
                    <TableCell className="text-sm font-medium">{p.rank}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </TableCell>
                    <TableCell className="text-right text-sm">{p.sold}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{p.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `PKR ${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "hsl(220, 25%, 11%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(166, 72%, 40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
