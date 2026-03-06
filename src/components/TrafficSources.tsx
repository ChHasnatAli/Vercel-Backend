import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Direct", value: 35, color: "hsl(166, 72%, 40%)" },
  { name: "Organic", value: 28, color: "hsl(200, 70%, 50%)" },
  { name: "Referral", value: 22, color: "hsl(220, 60%, 55%)" },
  { name: "Social", value: 15, color: "hsl(280, 60%, 55%)" },
];

export function TrafficSources() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Traffic Sources</CardTitle>
        <CardDescription>Where your visitors come from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">284K</span>
              <span className="text-xs text-muted-foreground">Visits</span>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {data.map((item) => (
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
  );
}
