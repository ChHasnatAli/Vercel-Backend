import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { type OrderStatus } from "@/lib/orders";
import { createSharedOrder, fetchSharedOrders } from "@/lib/orderApi";

export default function NewOrder() {
  const navigate = useNavigate();
  const [knownCustomers, setKnownCustomers] = useState<string[]>([]);
  const [existingCustomer, setExistingCustomer] = useState("");
  const [manualCustomer, setManualCustomer] = useState("");
  const [product, setProduct] = useState("Hibiscus Flower (Powder) - 100gm");
  const [quantity, setQuantity] = useState("2");
  const [amount, setAmount] = useState("1600");
  const [status, setStatus] = useState<OrderStatus>("Pending payment");

  useEffect(() => {
    const loadKnownCustomers = async () => {
      try {
        const orders = await fetchSharedOrders();
        const customers = Array.from(new Set(orders.map((order) => order.customerName).filter(Boolean)));
        setKnownCustomers(customers);
        if (customers.length > 0) {
          setExistingCustomer(customers[0]);
        }
      } catch {
        setKnownCustomers([]);
      }
    };

    loadKnownCustomers();
  }, []);

  const handleSubmit = async () => {
    const customer = manualCustomer.trim() || existingCustomer;
    if (!customer) {
      toast({ title: "Error", description: "Customer name is required.", variant: "destructive" });
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "Total amount must be greater than zero.", variant: "destructive" });
      return;
    }

    try {
      const created = await createSharedOrder({
        customerName: customer,
        status,
        totalAmount: numericAmount,
        currency: "PKR",
        origin: "Web admin",
        items: [
          {
            name: product,
            quantity: Math.max(1, Number(quantity) || 1),
            unitPrice: numericAmount,
            lineTotal: numericAmount,
          },
        ],
      });

      toast({ title: "Order created", description: `Order #${created.id} for ${customer} has been added.` });
      navigate(`/orders/${created.id}`);
    } catch {
      toast({ title: "Error", description: "Could not create order on local server.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal">Add order</h1>
        <p className="text-muted-foreground text-sm mt-1">Admin can create manual orders for existing or custom customers.</p>
      </div>

      <Card className="bg-card border-border w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Order Details</CardTitle>
          <CardDescription>Select customer from your WP list or enter customer manually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Existing customer (from WP users)</Label>
            <Select value={existingCustomer} onValueChange={setExistingCustomer}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {knownCustomers.length === 0 ? (
                  <SelectItem value="none" disabled>No customers yet</SelectItem>
                ) : null}
                {knownCustomers.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Or add customer manually</Label>
            <Input placeholder="Type custom customer name" value={manualCustomer} onChange={(e) => setManualCustomer(e.target.value)} className="bg-secondary border-none" />
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Input placeholder="e.g. Ashwagandha Capsules" value={product} onChange={(e) => setProduct(e.target.value)} className="bg-secondary border-none" />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-secondary border-none" />
          </div>

          <div className="space-y-2">
            <Label>Total amount (Rs)</Label>
            <Input type="number" min="1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary border-none" />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending payment">Pending payment</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">Add order</Button>
            <Button variant="outline" onClick={() => navigate("/orders")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}