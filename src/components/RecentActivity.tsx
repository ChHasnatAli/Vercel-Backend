import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, UserPlus, Star, CreditCard, CheckCircle, Package } from "lucide-react";

const activities = [
  { icon: ShoppingBag, color: "text-primary", title: "New order placed", desc: "Emma Wilson purchased Ashwagandha Capsules", time: "2 min ago" },
  { icon: UserPlus, color: "text-info", title: "New customer registered", desc: "James Chen created an account", time: "15 min ago" },
  { icon: Star, color: "text-warning", title: "5-star review received", desc: '"Excellent herbal blend — noticeable improvements!"', time: "1 hour ago" },
  { icon: CreditCard, color: "text-success", title: "Payment received", desc: "PKR 39.95 from Sofia Garcia", time: "2 hours ago" },
  { icon: CheckCircle, color: "text-primary", title: "Support ticket resolved", desc: "Ticket #4521 marked as resolved", time: "3 hours ago" },
  { icon: Package, color: "text-info", title: "New order placed", desc: "Alex Thompson purchased Triphala Powder", time: "5 hours ago" },
];

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest events from your store</CardDescription>
        </div>
        <span className="text-sm text-primary hover:underline cursor-pointer">View all →</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 ${a.color}`}>
                <a.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
