import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  iconColor?: string;
}

export function StatCard({ title, value, change, positive, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {positive ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={positive ? "text-success" : "text-destructive"}>{change}</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const dashboardStats: StatCardProps[] = [
  { title: "Total Revenue", value: "PKR 48,295", change: "+12.5%", positive: true, icon: DollarSign, iconColor: "text-primary" },
  { title: "Active Users", value: "2,847", change: "+8.2%", positive: true, icon: Users, iconColor: "text-info" },
  { title: "Total Orders", value: "1,432", change: "-3.1%", positive: false, icon: ShoppingCart, iconColor: "text-warning" },
  { title: "Page Views", value: "284K", change: "+24.7%", positive: true, icon: Eye, iconColor: "text-primary" },
];
