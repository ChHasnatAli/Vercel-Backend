import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const goals = [
  { name: "Monthly Revenue", current: 48295, target: 55000, pct: 88, color: "bg-primary" },
  { name: "New Customers", current: 847, target: 1000, pct: 85, color: "bg-info" },
  { name: "Conversion Rate", current: 3.8, target: 5, pct: 76, color: "bg-primary" },
];

export function MonthlyGoals() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Monthly Goals</CardTitle>
        <CardDescription>Track progress toward targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {goals.map((goal) => (
          <div key={goal.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{goal.name}</span>
              <span className="text-sm text-primary">{goal.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${goal.color} transition-all`}
                style={{ width: `${goal.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>{typeof goal.current === "number" && goal.current > 100 ? goal.current.toLocaleString() : goal.current}</span>
              <span>Target: {typeof goal.target === "number" && goal.target > 100 ? goal.target.toLocaleString() : goal.target}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
