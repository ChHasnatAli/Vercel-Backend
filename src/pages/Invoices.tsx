import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, MoreHorizontal } from "lucide-react";

const allInvoices = [
  { id: "INV-2041", initials: "AK", name: "Ali Khan", email: "ali.khan@example.pk", order: "ORD-7891", status: "paid", issued: "Feb 14, 2026", due: "Mar 14, 2026", amount: "PKR 299.00" },
  { id: "INV-2040", initials: "FA", name: "Fatima Ahmed", email: "fatima.ahmed@company.pk", order: "ORD-7890", status: "pending", issued: "Feb 14, 2026", due: "Mar 14, 2026", amount: "PKR 599.00" },
  { id: "INV-2039", initials: "HU", name: "Hassan Usman", email: "hassan.usman@startup.pk", order: "ORD-7889", status: "paid", issued: "Feb 13, 2026", due: "Mar 13, 2026", amount: "PKR 1,499.00" },
  { id: "INV-2038", initials: "SA", name: "Sana Aslam", email: "sana.aslam@dev.pk", order: "ORD-7888", status: "pending", issued: "Feb 13, 2026", due: "Mar 13, 2026", amount: "PKR 79.00" },
  { id: "INV-2037", initials: "BM", name: "Bilal Malik", email: "bilal.malik@agency.pk", order: "ORD-7887", status: "paid", issued: "Feb 12, 2026", due: "Mar 12, 2026", amount: "PKR 299.00" },
  { id: "INV-2036", initials: "OS", name: "Omar Siddiqui", email: "omar.siddiqui@design.pk", order: "ORD-7885", status: "paid", issued: "Feb 11, 2026", due: "Mar 11, 2026", amount: "PKR 299.00" },
  { id: "INV-2035", initials: "MR", name: "Mariam Raza", email: "mariam.raza@startup.pk", order: "ORD-7884", status: "paid", issued: "Feb 11, 2026", due: "Mar 11, 2026", amount: "PKR 1,499.00" },
  { id: "INV-2034", initials: "NA", name: "Noman Akhtar", email: "noman.akhtar@corp.pk", order: "ORD-7883", status: "overdue", issued: "Jan 10, 2026", due: "Feb 10, 2026", amount: "PKR 789.00" },
];

const statusColors: Record<string, string> = {
  paid: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  overdue: "bg-destructive text-destructive-foreground",
};

const avatarColors = ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive", "bg-chart-3", "bg-chart-4", "bg-chart-2"];

export default function Invoices() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = allInvoices
    .filter((inv) => filter === "all" || inv.status === filter)
    .filter((inv) => inv.id.toLowerCase().includes(search.toLowerCase()) || inv.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your invoices.</p>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="bg-secondary h-9">
          <TabsTrigger value="all" className="text-xs px-4">All</TabsTrigger>
          <TabsTrigger value="paid" className="text-xs px-4">Paid</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs px-4">Pending</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs px-4">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-secondary border-none" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="w-3 h-3" /> Export
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invoice, i) => (
                <TableRow key={invoice.id} className="border-border">
                  <TableCell className="text-sm font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${avatarColors[i % avatarColors.length]}`}>
                        <AvatarFallback className="text-xs text-primary-foreground bg-transparent">{invoice.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{invoice.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{invoice.order}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[invoice.status]} capitalize text-[10px] px-2`}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.issued}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.due}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{invoice.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {allInvoices.length} invoices</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button size="sm" className="bg-primary text-primary-foreground h-8 w-8 p-0">1</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
