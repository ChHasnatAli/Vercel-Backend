import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 18000 },
  { month: "Feb", revenue: 16000 },
  { month: "Mar", revenue: 22000 },
  { month: "Apr", revenue: 20000 },
  { month: "May", revenue: 25000 },
  { month: "Jun", revenue: 28000 },
  { month: "Jul", revenue: 30000 },
  { month: "Aug", revenue: 33000 },
  { month: "Sep", revenue: 38000 },
  { month: "Oct", revenue: 42000 },
  { month: "Nov", revenue: 48000 },
  { month: "Dec", revenue: 55000 },
];

export function OverviewChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>Monthly performance for the current year</CardDescription>
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
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `PKR ${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 25%, 11%)",
                border: "1px solid hsl(220, 20%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
              }}
              formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(166, 72%, 40%)" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
