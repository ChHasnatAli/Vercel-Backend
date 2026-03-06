import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { buildCustomerSummaries, fetchSharedOrders, type SharedOrder } from "@/lib/orderApi";

type ReportRange = "today" | "7d" | "30d" | "month" | "custom";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replace(/\"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const head = headers.map(csvEscape).join(",");
  const body = rows
    .map((row) => headers.map((header) => csvEscape(row[header])).join(","))
    .join("\n");

  return `${head}\n${body}`;
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fileDate(valueMs: number) {
  return formatDateInput(new Date(valueMs));
}

function rangeBounds(range: ReportRange, customFrom: string, customTo: string) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return { start, end };
  }

  if (range === "7d") {
    const start = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    return { start, end: now.getTime() };
  }

  if (range === "30d") {
    const start = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    return { start, end: now.getTime() };
  }

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return { start, end };
  }

  const parsedFrom = customFrom ? new Date(customFrom).getTime() : Number.NaN;
  const parsedTo = customTo ? new Date(customTo).getTime() : Number.NaN;
  const start = Number.isNaN(parsedFrom)
    ? new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    : parsedFrom;
  const inclusiveEnd = Number.isNaN(parsedTo)
    ? end
    : parsedTo + 24 * 60 * 60 * 1000 - 1;

  return { start, end: inclusiveEnd };
}

export default function Reports() {
  const [orders, setOrders] = useState<SharedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<ReportRange>("month");
  const [customFrom, setCustomFrom] = useState(() => formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [customTo, setCustomTo] = useState(() => formatDateInput(new Date()));

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
        }
        const nextOrders = await fetchSharedOrders();
        if (!isMounted) {
          return;
        }
        setOrders(nextOrders);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const bounds = useMemo(() => rangeBounds(range, customFrom, customTo), [customFrom, customTo, range]);
  const fileRange = useMemo(() => {
    const from = fileDate(bounds.start);
    const to = fileDate(bounds.end);
    return `${from}-to-${to}`;
  }, [bounds.end, bounds.start]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      if (Number.isNaN(createdAt)) {
        return false;
      }
      return createdAt >= bounds.start && createdAt <= bounds.end;
    });
  }, [bounds.end, bounds.start, orders]);

  const customers = useMemo(() => buildCustomerSummaries(filteredOrders), [filteredOrders]);

  const reportSummary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return {
      range,
      from: new Date(bounds.start).toISOString(),
      to: new Date(bounds.end).toISOString(),
      generatedAt: new Date().toISOString(),
      totals: {
        orders: filteredOrders.length,
        customers: customers.length,
        revenue: Number(totalRevenue.toFixed(2)),
      },
    };
  }, [bounds.end, bounds.start, customers.length, filteredOrders, range]);

  const downloadOrders = () => {
    const rows = filteredOrders.flatMap((order) => {
      const base = {
        orderId: order.id,
        createdAt: order.createdAt,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        city: order.city,
        postalCode: order.postalCode,
        address: order.address,
        paymentMethod: order.paymentMethod,
        couponCode: order.couponCode ?? "",
        discountAmount: Number(order.discountAmount ?? 0),
        subtotalAmount: Number(order.subtotalAmount ?? order.totalAmount ?? 0),
        totalAmount: Number(order.totalAmount || 0),
        currency: order.currency,
        origin: order.origin,
      };

      if (!order.items || order.items.length === 0) {
        return [
          {
            ...base,
            itemProductId: "",
            itemName: "",
            itemQuantity: 0,
            itemUnitPrice: 0,
            itemLineTotal: 0,
          },
        ];
      }

      return order.items.map((item) => ({
        ...base,
        itemProductId: item.productId,
        itemName: item.name,
        itemQuantity: Number(item.quantity ?? 0),
        itemUnitPrice: Number(item.unitPrice ?? 0),
        itemLineTotal: Number(item.lineTotal ?? 0),
      }));
    });

    downloadTextFile(
      `orders-report-${fileRange}.csv`,
      toCsv(rows),
      "text/csv;charset=utf-8",
    );
  };

  const downloadCustomers = () => {
    const rows = customers.map((customer) => ({
      name: customer.name,
      email: customer.email,
      totalOrders: customer.orders,
      totalSpent: customer.spent,
      lastOrderAt: customer.lastOrderAt,
      status: customer.status,
    }));

    downloadTextFile(
      `customers-report-${fileRange}.csv`,
      toCsv(rows),
      "text/csv;charset=utf-8",
    );
  };

  const downloadSummary = () => {
    downloadTextFile(
      `summary-report-${fileRange}.json`,
      JSON.stringify(reportSummary, null, 2),
      "application/json;charset=utf-8",
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Download orders and customer reports for daily, weekly, monthly, or custom ranges.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Date Range</CardTitle>
          <CardDescription>Choose a period and export your reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={range === "today" ? "default" : "outline"} onClick={() => setRange("today")}>Today</Button>
            <Button size="sm" variant={range === "7d" ? "default" : "outline"} onClick={() => setRange("7d")}>Last 7 Days</Button>
            <Button size="sm" variant={range === "30d" ? "default" : "outline"} onClick={() => setRange("30d")}>Last 30 Days</Button>
            <Button size="sm" variant={range === "month" ? "default" : "outline"} onClick={() => setRange("month")}>This Month</Button>
            <Button size="sm" variant={range === "custom" ? "default" : "outline"} onClick={() => setRange("custom")}>Custom</Button>
          </div>

          {range === "custom" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-9" />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground text-xs">Orders</p>
              <p className="text-xl font-semibold">{filteredOrders.length}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground text-xs">Customers</p>
              <p className="text-xl font-semibold">{customers.length}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground text-xs">Revenue</p>
              <p className="text-xl font-semibold">PKR {reportSummary.totals.revenue.toLocaleString("en-PK")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadOrders} className="gap-2" disabled={isLoading}>
              <Download className="w-4 h-4" /> Download All Orders Details CSV
            </Button>
            <Button onClick={downloadCustomers} variant="outline" className="gap-2" disabled={isLoading}>
              <Download className="w-4 h-4" /> Download Customers CSV
            </Button>
            <Button onClick={downloadSummary} variant="outline" className="gap-2" disabled={isLoading}>
              <Download className="w-4 h-4" /> Download Summary JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
