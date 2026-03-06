import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildCustomerSummaries, fetchSharedOrders, formatCustomerSpend, formatOrderDate, type CustomerSummary } from "@/lib/orderApi";

const avatarColors = ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive", "bg-chart-3", "bg-chart-4", "bg-chart-2"];

export default function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async (showLoader = false) => {
      try {
        if (showLoader && isMounted) {
          setIsLoading(true);
        }
        const orders = await fetchSharedOrders();
        if (!isMounted) {
          return;
        }
        setCustomers(buildCustomerSummaries(orders));
        setError(null);
      } catch {
        if (isMounted) {
          setError("Could not load customers from shared orders. Start local-sync-server.");
        }
      } finally {
        if (showLoader && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCustomers(true);
    const intervalId = window.setInterval(() => {
      void loadCustomers(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
    });
  }, [customers, search]);

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "GU"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard &gt; Customers</p>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your customer relationships.</p>
        </div>
        <Button className="bg-primary text-primary-foreground gap-1">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-9 h-9 bg-secondary border-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {isLoading ? <p className="text-xs text-muted-foreground">Loading customers...</p> : null}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c, i) => (
                <TableRow key={`${c.email}-${c.name}`} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${avatarColors[i % avatarColors.length]}`}>
                        <AvatarFallback className="text-xs text-primary-foreground bg-transparent">{getInitials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">{c.orders}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCustomerSpend(c.spent)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatOrderDate(c.lastOrderAt)}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 capitalize ${c.status === "active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
