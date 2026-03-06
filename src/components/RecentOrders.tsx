import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSharedOrders, formatOrderTotal, type SharedOrder } from "@/lib/orderApi";

const statusColors: Record<string, string> = {
  completed: "bg-success text-success-foreground",
  processing: "bg-info text-info-foreground",
  pending: "bg-warning text-warning-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const avatarColors = ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive", "bg-chart-3"];

export function RecentOrders() {
  const [data, setData] = useState<SharedOrder[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const orders = await fetchSharedOrders();
        if (isMounted) {
          setData(orders.slice(0, 6));
        }
      } catch {
        if (isMounted) {
          setData([]);
        }
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const orders = data.map((order) => {
    const initials = order.customerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "GU";

    const status =
      order.status === "Pending payment"
        ? "pending"
        : order.status === "Processing"
          ? "processing"
          : order.status === "Cancelled"
            ? "cancelled"
            : "completed";

    return {
      initials,
      name: order.customerName,
      email: order.customerEmail || "customer@infusion.store",
      id: `#${order.id}`,
      product: order.origin,
      status,
      amount: formatOrderTotal(order.totalAmount, order.currency),
    };
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <CardDescription>Latest transactions from your store</CardDescription>
        </div>
        <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Customer</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, i) => (
              <TableRow key={order.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-8 w-8 ${avatarColors[i % avatarColors.length]}`}>
                      <AvatarFallback className="text-xs text-primary-foreground bg-transparent">{order.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{order.id}</TableCell>
                <TableCell className="text-sm">{order.product}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[order.status]} capitalize text-[10px] px-2`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm font-medium">{order.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
