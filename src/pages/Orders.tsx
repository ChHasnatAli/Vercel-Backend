import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchSharedOrders, formatOrderDate, formatOrderTotal, SharedOrder } from "@/lib/orderApi";

export default function Orders() {
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("All dates");
  const [selectedChannel, setSelectedChannel] = useState("All sales channels");
  const [orders, setOrders] = useState<SharedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async (showLoader = false) => {
      try {
        if (showLoader && isMounted) {
          setIsLoading(true);
        }
        const data = await fetchSharedOrders();
        if (!isMounted) {
          return;
        }
        setOrders(data);
        setError(null);
      } catch {
        if (isMounted) {
          setError("Could not load shared orders. Start local-sync-server and refresh.");
        }
      } finally {
        if (showLoader && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders(true);
    const intervalId = window.setInterval(() => {
      void loadOrders(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return orders.filter((row) => {
      const matchQuery = !query || row.customerName.toLowerCase().includes(query) || row.id.includes(query);
      const matchDate = selectedDate === "All dates" || row.createdAt.includes("2026");
      const matchChannel = selectedChannel === "All sales channels" || row.origin.toLowerCase().includes("web");
      return matchQuery && matchDate && matchChannel;
    });
  }, [orders, searchText, selectedDate, selectedChannel]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-normal">Orders</h1>
          <Link to="/orders/new">
            <Button variant="outline" size="sm" className="h-7 text-xs">Add order</Button>
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">{orders.length} items</div>
      </div>

      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs font-normal">Bulk actions</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">Apply</Button>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option>All dates</option>
              <option>February 2026</option>
            </select>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option>All sales channels</option>
              <option>Web admin</option>
              <option>Organic Google</option>
            </select>
            <Input placeholder="Filter by registered customer" className="h-7 w-56 text-xs" />
            <Button variant="outline" size="sm" className="h-7 text-xs">Filter</Button>
            <div className="ml-auto flex items-center gap-2">
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-7 w-44 text-xs" />
              <Button variant="outline" size="sm" className="h-7 text-xs">Search orders</Button>
            </div>
          </div>
          {error ? <p className="text-xs text-destructive px-1">{error}</p> : null}
          {isLoading ? <p className="text-xs text-muted-foreground px-1">Loading orders...</p> : null}

          <div className="rounded-sm border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-8" />
                  <TableHead className="text-xs">Order</TableHead>
                  <TableHead className="text-xs">Login as User</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Origin</TableHead>
                  <TableHead className="text-xs">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((row) => (
                  <TableRow key={row.id} className="text-xs">
                    <TableCell>
                      <input type="checkbox" className="h-3.5 w-3.5" />
                    </TableCell>
                    <TableCell>
                      <Link to={`/orders/${row.id}`} className="text-primary hover:underline font-semibold">#{row.id}</Link>
                      <div className="text-[11px] text-muted-foreground">
                        <Link to={`/orders/${row.id}`} className="hover:underline">{row.customerName}</Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" className="h-auto px-0 text-[11px]">Unlock with PRO</Button>
                    </TableCell>
                    <TableCell>{formatOrderDate(row.createdAt)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded px-2 py-0.5 text-[11px] ${row.status === "Completed" ? "bg-info text-info-foreground" : row.status === "Processing" ? "bg-primary/20 text-primary" : row.status === "Cancelled" ? "bg-destructive/20 text-destructive" : "bg-warning text-warning-foreground"}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatOrderTotal(row.totalAmount, row.currency)}</TableCell>
                    <TableCell>{row.origin}</TableCell>
                    <TableCell>{`INF_${row.id}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>{filteredOrders.length} items</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">&lt;</Button>
              <Button variant="outline" size="sm" className="h-6 px-2">1</Button>
              <span>of {Math.max(1, Math.ceil(orders.length / 20))}</span>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">&gt;</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
